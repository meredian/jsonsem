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

ObjectValidator.prototype.validate = function(path, value, data_wrapper) {
    this.constructor.super_.prototype.validate.call(this, path, value, data_wrapper);
    if (_.isObject(value)) {
        _.each(this.keys, function(validator, key) {
            if (_.isUndefined(value[key])) {
                if (!validator.params.optional) {
                    this.dsl.error(path, "Key " + key + " is missing");
                }
            } else {
                var subpath = data_wrapper.concat_paths(path, key);
                validator.validate(subpath, value[key], data_wrapper);
            }
        }, this);

        var left_keys = _.filter(_.keys(value), function(key) {
            return !this.keys[key];
        }, this);

        if (left_keys.length) {
            if (this.opts.other_keys_restricted) {
                this.dsl.error(path, "Unexpected keys: " + left_keys.join(", ") + "; Allowed keys: " + _.keys(this.keys).join(", "));
            } else if (this.each_key_scope) {
                _.each(left_keys, function(key) {
                    var subpath = data_wrapper.concat_paths(path, key);
                    this.each_key_scope.restriction.check_key(path, key, data_wrapper);
                    this.each_key_scope.validator.validate(subpath, value[key], data_wrapper);
                }, this);
            }
        }
    } else {
        this.dsl.error(path, "Received " + value + ", Object expected");
    }
};

ObjectValidator.prototype.key = function(name, params, fn) {
    this.keys[name] = this.dsl.get_validator(params, fn);
};

ObjectValidator.prototype.optional_key = function(name, params, fn) {
    this.key(name, _.extend({optional: true}, params), fn);
};

ObjectValidator.prototype.each_key = function(restriction, params, fn) {
    this.each_key_scope = { restriction: restriction, validator: this.dsl.get_validator(params, fn) };
};

ObjectValidator.prototype.other_keys_restricted = function() {
    this.opts.other_keys_restricted = true;
};
