var _ = require('lodash');
var Validators = require('./validators');
var DataWrapper = require('./data_wrapper');

var DSL = module.exports = function(schema) {
    this.errors = [];
    this.custom_validators = {};
    this.schema = new Validators.object(this, {}, schema);
};

DSL.prototype.error = function(path, msg) {
    this.errors.push([path, msg]);
};

DSL.prototype.validate = function(data) {
    this.errors = [];
    this.schema.validate(null, data, new DataWrapper(data));
    if (this.errors.length) {
        console.log(this.errors);
    }
    return !this.errors.length;
};

DSL.prototype.get_validator = function(params, fn) {
    var type = params.type;
    if (!type) {
        throw new Error("Validator type is missing");
    }
    if (Validators[type]) {
        return new Validators[type](this, params, fn);
    } else if (this.custom_validators[type]) {
        return this.custom_validators[type](params, fn);
    } else {
        throw new Error("Unknown validator type: " + params.type);
    };
};

DSL.prototype.set_custom_validator = function(name, params, fn) {
    var self = this;
    // TODO: Remove double initialization. Used to unwind primitive validator type
    this.custom_validators[name] = function(additional_params, extra_fn) {
        var validator = self.get_validator(params, fn);
        var new_params = _.extend(validator.params, additional_params, {type: validator.params.type});
        return self.get_validator(new_params, function() {
            extra_fn && extra_fn.call(this);
            fn.call(this);
        });
    };
};
