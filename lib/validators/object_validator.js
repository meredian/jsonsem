var _ = require('lodash');
var util = require('util');
var BaseValidator = require('./base_validator');

var ObjectValidator = module.exports = function(dsl, params, fn) {
    BaseValidator.apply(this, arguments);
    this.keys = {};
    this.opts = {};
    fn.call(this);
};

util.inherits(ObjectValidator, BaseValidator);

ObjectValidator.prototype.validate = function(path, value) {
    ObjectValidator.super_.prototype.call(this, path, value);
};

ObjectValidator.prototype.key = function(name, params, fn) {
    this.keys[name] = this.dsl.get_validator(params, fn);
};

ObjectValidator.prototype.optional_key = function(name, params, fn) {
    this.key(name, _.extend({optional: true}, params), fn);
};

ObjectValidator.prototype.each_key = function(restriction, params, fn) {
    this.each_key_scope = { restriction: restriction, validator: this.dsl.get_validator(params, fn) }
};

ObjectValidator.prototype.other_keys_restricted = function() {
    this.opts.other_keys_restricted = true;
};
