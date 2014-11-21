var _ = require('lodash');

module.exports = function() {
    this.type('boolean', {type: 'base'}, function() {
        this.typeAssertion(function(value) {
            return value === true || value === false;
        });
    });
};

