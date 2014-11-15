var _ = require('lodash');

var Scope = module.exports = function(dsl, parent) {
    this.dsl = dsl;
    this.parent = parent;
    this.types = {};
    this.allowedProps = [];
};

Scope.prototype.error = function(msg) {
    console.log(msg);
};

Scope.prototype.getType = function(type) {
    if (this.types[type]) {
        return this.types[type];
    } else if (this.parent) {
        return this.parent.getType(type);
    } else {
        throw new Error("Validator type " + type + " not found");
    }
};

Scope.prototype.hasType = function(type) {
    return this.types[type] || (this.parent && this.parent.hasType(type));
};

Scope.prototype.addType = function(type, ctor) {
    if (this.hasType(type)) {
        throw new Error("Validator type " + type + " already defined in current scope");
    } else {
        this.types[type] = ctor;
    }
};

Scope.prototype.hasProp = function(prop) {
    return (this.allowedProps.indexOf(prop) >= 0) || (this.parent && this.parent.hasProp(prop));
};

Scope.prototype.addProp = function(prop) {
    if (this.hasProp(prop)) {
        throw new Error("Scope property " + prop + " already defined in current scope");
    }
    this.allowedProps.push(prop);
};

Scope.prototype.getValidator = function(props, schema) {
    var self = this;
    if (!props.type) {
        throw new Error("Property type missing in Validator parameters");
    }

    var type = this.getType(props.type);

    Object.keys(props).forEach(function(name) {
        if (!self.hasProp(name) && !type.props.hasOwnProperty(name)) {
            throw new Error("Validator property " + name + " is unknown in current scope");
        }
    });

    _.each(props, function(value, name, obj) {
        console.log(value, name, obj);
    }, this);

    return new type(this, props, schema);
};
