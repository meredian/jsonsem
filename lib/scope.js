var _ = require('lodash');

var Scope = module.exports = function(dsl, parent) {
    this.dsl = dsl;
    this.parent = parent;
    if (this.parent) {
        this.parent.children.push(this);
    }
    this.types = {};
    this.allowedProps = [];
    this.children = [];
};

Scope.prototype.error = function(path, msg) {
    this.dsl.error(path, msg);
};

Scope.prototype.getType = function(type) {
    var ctor = this.getTypeOrNull(type);
    if (!ctor) {
        throw new Error("Validator type " + type + " not found");
    }
    return ctor;
};

Scope.prototype.getTypeOrNull = function(type) {
    if (this.types[type]) {
        return this.types[type];
    } else if (this.parent) {
        return this.parent.getTypeOrNull(type);
    } else {
        return null;
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

Scope.prototype.rewriteType = function(type, ctor) {
    this.types[type] = ctor;
};

Scope.prototype.hasProperty = function(prop) {
    return (this.allowedProps.indexOf(prop) >= 0) || (this.parent && this.parent.hasProperty(prop)) || false;
};

Scope.prototype.addProperty = function(prop) {
    if (this.hasProperty(prop)) {
        throw new Error("Scope property " + prop + " already defined in current scope");
    }
    this.allowedProps.push(prop);
};

Scope.prototype.getValidator = function(props, schema) {
    if (!props.type) {
        throw new Error("Property type missing in Validator parameters");
    }

    var type = this.getType(props.type);
    props = _.defaults(props, type.props);

    _.forOwn(props, function(value, name, obj) {
        if (!this.hasProperty(name) && !type.hasProperty(name)) {
            throw new Error("Validator property " + name + " is unknown in current scope");
        }
    }, this);

    return new type(this, props, schema);
};
