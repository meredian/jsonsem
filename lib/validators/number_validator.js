var _ = require('lodash');
var util = require('util');
var BaseValidator = require('./base_validator');

var NumberValidator = module.exports = function(dsl, params, fn) {
    BaseValidator.apply(this, arguments);
};

util.inherits(NumberValidator, BaseValidator);

NumberValidator.prototype.validate = function(path, value) {
    var self = this;
    this.constructor.super_.prototype.validate.call(this, path, value);
    if (!_.isNumber(value) || _.isNaN(value)) {
        this.error(path, "Received " + value + ", Number expected");
    }
};
