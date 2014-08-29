var _ = require("lodash");
var Restrictions = require('../restrictions');
var Assertion = require('../assertion');

var BaseValidator = module.exports = function(dsl, params, fn) {
    this.dsl = dsl;
    this.params = params;
    this.assertions = this.params.assert ? [this.params.assert] : [];
};

BaseValidator.prototype.validate = function(path, value, data_wrapper) {
    this.assertions.forEach(function(assertion) {
        assertion.assert(path, value);
    });
};

BaseValidator.prototype.type = function(name, params, fn) {
    this.dsl.set_custom_validator(name, params, fn);
};

BaseValidator.prototype.assert = function(name, fn) {
    this.assertions.push(this.assertion(name, fn));
};

BaseValidator.prototype.assertion = function(name, fn) {
    return new Assertion(this.dsl, name, fn);
};

_.each(Restrictions, function(restriction, key) {
    BaseValidator.prototype[key] = function(params) {
        return new restriction(this.dsl, params);
    };
});
