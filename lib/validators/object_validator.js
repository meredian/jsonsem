var util = require('util')
var BaseValidator = require('./base_validator');

var ObjectValidator = module.exports = function(dsl, params, fn) {
    BaseValidator.apply(this, arguments);
};

util.inherits(ObjectValidator, BaseValidator)

ObjectValidator.prototype.validate = function(path, value) {
    ObjectValidator.super_.prototype.call(this, path, value);
};