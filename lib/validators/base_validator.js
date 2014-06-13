var BaseValidator = module.exports = function(dsl, params, fn) {
    this.dsl = dsl;
    this.params = params;
};

BaseValidator.prototype.error = function(path, msg) {
    this.dsl.errors.push([path, msg]);
};

BaseValidator.prototype.validate = function(path, value) {

};