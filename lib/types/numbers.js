var _ = require('lodash');

module.exports = function() {
    this.type('number', {type: 'base'}, function() {
        this.typeAssertion(function(value) {
            return _.isNumber(value) && !_.isNaN(value);
        });

        this.property('min', function(min, value) {
            return min <= value;
        });

        this.property('max', function(max, value) {
            return max >= value;
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

