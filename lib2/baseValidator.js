var _ = require('lodash');
var TypeBuilder = require('./typeBuilder');

var BaseValidator = module.exports = function(scope, props, schema) {
    this.scope = scope;
    this.props = props;
    if (schema) {
        schema.call(this);
    }
};

BaseValidator.prototype.name = 'name';

BaseValidator.prototype.include = function(schema) {
    schema.call(this);
    return this;
};

BaseValidator.prototype.type = function(name, props, schema) {
    TypeBuilder.build(this.scope, name, props, schema);
};

BaseValidator.prototype.validate = function(value, path, dataWrapper) {};

BaseValidator.props = {};
BaseValidator.methods = Object.keys(BaseValidator.prototype);
