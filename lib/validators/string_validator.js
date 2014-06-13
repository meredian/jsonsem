var util = require('util');
var BaseValidator = require('./base_validator');

var StringValidator = module.exports = function(dsl, params, fn) {
    BaseValidator.apply(this, arguments);
};

util.inherits(StringValidator, BaseValidator);
