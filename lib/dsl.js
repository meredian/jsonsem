var Validators = require('./validators');

var DSL = module.exports = function(schema) {
    this.schema = new Validators.object(this, {}, schema);
    this.errors = [];
};

DSL.prototype.validate = function(json) {
    this.schema.validate(null, json);
    return !this.errors.length;
};
