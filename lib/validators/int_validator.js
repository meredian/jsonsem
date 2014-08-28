var _ = require('lodash');
var util = require('util');
var BaseValidator = require('./base_validator');

var IntValidator = module.exports = function(dsl, params, fn) {
    BaseValidator.apply(this, arguments);
};

util.inherits(IntValidator, BaseValidator);

IntValidator.prototype.validate = function(path, value, data_wrapper) {
    var self = this;
    this.constructor.super_.prototype.validate.call(this, path, value, data_wrapper);
    if (!_.isNumber(value) || _.isNaN(value) || (value % 1 !== 0)) {
        this.dsl.error(path, "Received " + value + ", Integer expected");
    }
};
