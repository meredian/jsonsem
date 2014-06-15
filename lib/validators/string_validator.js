var _ = require('lodash');
var util = require('util');
var BaseValidator = require('./base_validator');

var StringValidator = module.exports = function(dsl, params, fn) {
    BaseValidator.apply(this, arguments);
};

util.inherits(StringValidator, BaseValidator);

StringValidator.prototype.validate = function(path, value, data_wrapper) {
    var self = this;
    this.constructor.super_.prototype.validate.call(this, path, value, data_wrapper);
    if (!_.isString(value)) {
        this.error(path, "Received " + value + ", String expected");
    }
};
