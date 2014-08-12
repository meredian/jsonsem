var _ = require('lodash');
var util = require('util');
var BaseValidator = require('./base_validator');

var ArrayValidator = module.exports = function(dsl, params, fn) {
    BaseValidator.apply(this, arguments);
    this.indexes = {};
    this.opts = {};
    fn.call(this);
};

util.inherits(ArrayValidator, BaseValidator);

ArrayValidator.prototype.validate = function(path, value, data_wrapper) {
    this.constructor.super_.prototype.validate.call(this, path, value, data_wrapper);
    if (_.isArray(value)) {
        _.each(this.indexes, function(validator, index) {
            if (_.isUndefined(value[index])) {
                if (!validator.params.optional) {
                    this.dsl.error(path, "Index " + index + " is missing");
                }
            } else {
                var subpath = data_wrapper.concat_paths(path, index);
                validator.validate(subpath, value[index], data_wrapper);
            }
        }, this);

        var left_indexes = _.filter(_.keys(value), function(index) {
            return !this.indexes[index];
        }, this);

        if (left_indexes.length) {
            if (this.opts.other_indexes_restricted) {
                this.dsl.error(path, "Unexpected index: " + left_indexes.join(", ") + "; Allowed indexes: " + _.keys(this.indexes).join(", "));
            } else if (this.each_index_scope) {
                _.each(left_indexes, function(index) {
                    var subpath = data_wrapper.concat_paths(path, index);
                    this.each_index_scope.validate(subpath, value[index], data_wrapper);
                }, this);
            }
        }
    } else {
        this.dsl.error(path, "Received " + value + ", Array expected");
    }
};

ArrayValidator.prototype.index = function(num, params, fn) {
    this.indexes[num] = this.dsl.get_validator(params, fn);
};

ArrayValidator.prototype.optional_index = function(num, params, fn) {
    this.index(num, _.extend({optional: true}, params), fn);
};

ArrayValidator.prototype.each_index = function(params, fn) {
    this.each_index_scope = this.dsl.get_validator(params, fn);
};

ArrayValidator.prototype.other_indexes_restricted = function() {
    this.opts.other_indexes_restricted = true;
};
