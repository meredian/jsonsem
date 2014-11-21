var _ = require('lodash');

module.exports = function() {
    this.type('number', {type: 'base'}, function() {
        this.typeAssertion(function(value) {
            return _.isNumber(value) && !_.isNaN(value);
        });
    });

    this.type('uint', {type: 'number'}, function() {
        this.typeAssertion(function(value) {
            return (value % 1 === 0) && (value >= 0);
        });
    });

    this.type('int', {type: 'number'}, function() {
        this.typeAssertion(function(value) {
            return (value % 1 === 0);
        });
    });
};

