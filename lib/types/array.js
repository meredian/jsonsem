var _ = require('lodash');
var scope = require('../scope');

module.exports = function() {
    this.type('array', {type: 'base'}, function() {
        this.typeAssertion(function(value) {
            return _.isArray(value);
        });

        this.onCreate(function() {
            this.indexes = {};
            this.optionals = {};
            this.allowExtraIndexes = false;
        });

        this.onValidate(function(value, path, dataWrapper) {
        });

        this.method('index', function(index, props, schema) {
            this.indexes[index] = this.scope.getValidator(props, schema);
        });

        this.method('optionalIndex', function(key, props, schema) {
            this.index(key, pops, schema);
            this.optionals[key] = true;
        });
    });
};
