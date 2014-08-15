var _ = require('lodash');
var util = require('util');
var BaseValidator = require('./base_validator');

var BooleanValidator = module.exports = function(dsl, params, fn) {
    BaseValidator.apply(this, arguments);
};

util.inherits(BooleanValidator, BaseValidator);

BooleanValidator.prototype.validate = function(path, value, data_wrapper) {
    var self = this;
    this.constructor.super_.prototype.validate.call(this, path, value, data_wrapper);
    if (!(value === true || value === false)) {
        this.dsl.error(path, "Received " + value + ", Boolean expected");
    }
};
