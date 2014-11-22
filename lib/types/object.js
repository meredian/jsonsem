var _ = require('lodash');
var Scope = require('../scope');

module.exports = function() {
    this.type('object', {type: 'base'}, function() {
        this.typeAssertion(function(value) {
            return _.isObject(value);
        });

        this.onCreate(function() {
            this.scope = new Scope(this.scope.dsl, this.scope);
            this.keys = {};
            this.optionals = {};
            this.extraKeysAllowed = false;
        });

        this.onValidate(function(value, path, dataWrapper) {
            _.forOwn(this.keys, function(validator, key) {
                if (value.hasOwnProperty(key)) {
                    validator.validate(value[key], dataWrapper.concatPaths(path, key), dataWrapper);
                } else if (!this.optionals[key]) {
                    this.scope.error(path, "Key " + key + " is missing");
                }
            }, this);

            var leftKeys = _.difference(Object.keys(value), Object.keys(this.keys));
            if (leftKeys.length) {
                if (this.eachKeyScope) {
                    _.forOwn(leftKeys, function(key) {
                        var subpath = dataWrapper.concatPaths(path, key);
                        this.eachKeyScope.restriction(path, key, dataWrapper);
                        this.eachKeyScope.validator.validate(value[key], subpath, dataWrapper);
                    }, this);
                } else if (!this.extraKeysAllowed) {
                    this.scope.error(path, "Unexpected keys: " + leftKeys.join(", "));
                }
            }
        });

        this.method('key', function(key, props, schema) {
            this.keys[key] = this.scope.getValidator(props, schema);
        });

        this.method('optionalKey', function(key, props, schema) {
            this.key(key, props, schema);
            this.optionals[key] = true;
        });

        this.method('allowExtraKeys', function(value) {
            this.extraKeysAllowed = (value === undefined) ? true : value;
        });

        this.method('eachKey', function(restriction, props, schema) {
            this.eachKeyScope = {
                restriction: restriction,
                validator: this.scope.getValidator(props, schema)
            };
        });

        this.method('any', function() { return function() {}; });
        this.method('keyOf', function(sourcePath) {
            var scope = this.scope;
            return function(path, key, dataWrapper) {
                if (dataWrapper.getKeys(sourcePath).indexOf(key) < 0) {
                    scope.error(path, "Reference to unexisting key " + key + " at path " + path);
                }
            };
        });

        this.method('inSet', function(set) {
            var scope = this.scope;
            return function(path, key, dataWrapper) {
                if (set.indexOf(key) < 0) {
                    scope.error(path, "Key " + key + " is not in set " + JSON.stringify(set));
                }
            };
        });

    });
};
