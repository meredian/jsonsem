var _ = require('lodash');

module.exports = function() {
    this.type('object', {type: 'base'}, function() {
        this.typeAssertion(function(value) {
            return _.isObject(value);
        });

        this.property('size', function(size, value) {
            return Object.keys(value) === size;
        });

        this.onCreate(function() {
            this.keys = {};
            this.optionalKeys = {};
            this.otherKeysRestricted = false;
        });

        this.onValidate(function(value, path, dataWrapper) {
            _.each(this.keys, function(validator, key) {
                if (value.hasOwnProperty(key)) {
                    validator.validate(value[key], dataWrapper.concatPaths(path, key), dataWrapper);
                } else {
                    this.scope.error("Key " + key + " is missing");
                }
            }, this);
        });

        this.method('key', function(key, props, schema) {
            this.keys[key] = this.scope.getValidator(props, schema);
        });

        this.method('optionalKey', function(key, props, schema) {
            this.optionalKeys[key] = this.scope.getValidator(props, schema);
        });
    });
};
