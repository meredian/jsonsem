var _ = require('lodash');
var Scope = require('../scope');

module.exports = function() {
    this.type('array', {type: 'base'}, function() {
        this.typeAssertion(function(value) {
            return _.isArray(value);
        });

        this.onCreate(function() {
            this.scope = new Scope(this.scope.dsl, this.scope);
            this.indexes = {};
            this.optionals = {};
            this.extraIndexesAllowed = false;
        });

        this.onValidate(function(value, path, dataWrapper) {
            _.forOwn(this.indexes, function(validator, index) {
                if (value.hasOwnProperty(index)) {
                    validator.validate(value[index], dataWrapper.concatPaths(path, index), dataWrapper);
                } else if (!this.optionals[index]) {
                    this.scope.error(path, "Index " + index + " is missing");
                }
            }, this);

            var leftIndexes = _.difference(Object.keys(value), Object.keys(this.indexes));
            if (leftIndexes.length) {
                if (this.eachIndexScope) {
                    _.forOwn(leftIndexes, function(index) {
                        var subpath = dataWrapper.concatPaths(path, index);
                        if (this.eachIndexScope.restriction) {
                            this.eachIndexScope.restriction(path, index, dataWrapper);
                        }
                        this.eachIndexScope.validator.validate(value[index], subpath, dataWrapper);
                    }, this);
                } else if (this.extraIndexesAllowed) {
                    this.scope.error(path, "Unexpected indexes: " + leftIndexes.join(", "));
                }
            }

        });

        this.method('index', function(index, props, schema) {
            this.indexes[index] = this.scope.getValidator(props, schema);
        });

        this.method('optionalIndex', function(key, props, schema) {
            this.index(key, props, schema);
            this.optionals[key] = true;
        });

        this.method('allowExtraIndexes', function(value) {
            this.extraIndexesAllowed = (value === undefined) ? true : value;
        });

        this.method('eachIndex', function(restriction, props, schema) {
            this.eachIndexScope = {
                restriction: restriction,
                validator: this.scope.getValidator(props, schema)
            };
        });

        this.method('any', function() { return function() {}; });
        this.method('inSet', function(set) {
            var scope = this.scope;
            return function(path, index, dataWrapper) {
                if (set.indexOf(index) < 0) {
                    scope.error(path, "Index " + index + " is not in set " + JSON.stringify(set));
                }
            };
        });

    });
};
