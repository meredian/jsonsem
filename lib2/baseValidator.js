var _ = require('lodash');
var ValidatorBuilder = require('./ValidatorBuilder');

var BaseValidator = module.exports = function(scope, params, schema) {
    this.scope = scope;
    this.params = params;
    if (schema) {
        schema.call(this);
    }
};

BaseValidator.prototype.name = 'name';

BaseValidator.prototype.include = function(schema) {
    schema.call(this);
    return this;
};

BaseValidator.prototype.type = function(name, params, schema) {
    ValidatorBuilder.build(this.scope, name, params, schema);
};

BaseValidator.prototype.validate = function(value, path, dataWrapper) {};

BaseValidator.props = {};
BaseValidator.methods = Object.keys(BaseValidator.prototype);
