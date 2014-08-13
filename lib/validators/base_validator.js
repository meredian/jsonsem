var _ = require("lodash");
var Restrictions = require('../restrictions');

var BaseValidator = module.exports = function(dsl, params, fn) {
    this.dsl = dsl;
    this.params = params;
    this.assertions = this.params.assert ? [{fn: this.params.assert}] : [];
};

BaseValidator.prototype.validate = function(path, value, data_wrapper) {
    this.assertions.forEach(function(assertion) {
        if (!assertion.fn(value, path)) {
            this.dsl.error(path, "Assertion failed" + (assertion.name ? ': ' + assertion.name : ''));
        }
    }, this);
};

BaseValidator.prototype.type = function(name, params, fn) {
    this.dsl.set_custom_validator(name, params, fn);
};

BaseValidator.prototype.assert = function(name, fn) {
    if (_.isFunction(name)) {
        fn = name;
        name = null;
    }
        this.assertions.push({name: name, fn: fn});
};

_.each(Restrictions, function(restriction, key) {
    BaseValidator.prototype[key] = function(params) {
        return new restriction(this.dsl, params);
    };
});
