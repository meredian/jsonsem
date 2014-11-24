var _ = require('lodash');

module.exports = function() {
    this.type('string', {type: 'base'}, function() {
        this.typeAssertion(function(value) {
            return _.isString(value);
        });

        this.property('keyOf', function(sourcePath, value, path, dataWrapper) {
            return dataWrapper.getKeys(sourcePath).indexOf(value) >= 0;
        });

        this.property('length', function(length, value) {
            return value.length === length;
        });
    });
};

