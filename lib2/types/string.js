var _ = require('lodash');

module.exports = function() {
    this.type('string', {type: 'base'}, function() {
        this.typeAssertion(function(value) {
            return _.isString(value);
        });
        this.property('length', function(length, value) {
            return value.length === length;
        });
    });
};

