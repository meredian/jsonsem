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
        });

        this.onValidate(function(value, path, dataWrapper) {
            console.log("KEYS: ");
            _.each(this.keys, function(validator, name) {
                validator.validate(value[name], dataWrapper.concatPaths(path, name), dataWrapper);
            }, this);
        });

        this.method('key', function(name, props, schema) {
            this.keys[name] = this.scope.getValidator(props, schema);
        });

        this.method('optionalKey', function(name, props, schema) {
            this.optionalKeys[name] = this.scope.getValidator(props, schema);
        });
    });
};

