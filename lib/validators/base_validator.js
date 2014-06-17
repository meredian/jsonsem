var _ = require("lodash");
var Restrictions = require('../restrictions');

var BaseValidator = module.exports = function(dsl, params, fn) {
    this.dsl = dsl;
    this.params = params;
};

BaseValidator.prototype.validate = function(path, value, data_wrapper) {

};

BaseValidator.prototype.type = function(name, params, fn) {
    this.dsl.set_custom_validator(name, params, fn);
};

_.each(Restrictions, function(restriction, key) {
    BaseValidator.prototype[key] = function(params) {
        return new restriction(this.dsl, params);
    };
});
