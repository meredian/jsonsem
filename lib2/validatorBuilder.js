var _ = require('lodash');
var extend = require('./extend');

var ValidatorBuilder = module.exports = function(scope, name, props) {
    this.name = name;
    this.scope = scope;

    this.interface = {
        assertion: null,
        onValidate: null,
        onCreate: null,
        scopeProps: [],
        props: {},
        methods: {},
        methodCalls: []
    };

    if (!props.type) {
        throw new Error("Property type missing in type parameters");
    }

    this.parentType = this.scope.getType(props.type);
    this.parentTypeName = props.type;
    delete props.type;

    _.each(props, function(value, name) {
        if (!(this.scope.hasProp(name) || (this.parentType.props.hasOwnProperty(name)))) {
            throw new Error("Type property " + name + " is unknown in current scope");
        }
    }, this);

    _.each(this.parentType.methods, function(method) {
        this.constructor.prototype[method] = ValidatorBuilder.methodCallWrapper(this, method);
    }, this);

    this.props = props;
};

ValidatorBuilder.methodCallWrapper = function(builder, name) {
    return function() {
        builder.interface.methodCalls.push({name: name, arguments: arguments});
    };
};

ValidatorBuilder.build = function(scope, name, props, schema) {
    return new this(scope, name, props).schema(schema).build();
};

ValidatorBuilder.prototype.schema = function(schema) {
    if (schema) {
        schema.call(this);
    }
    return this;
};

ValidatorBuilder.prototype.typeAssertion = function(assertion) {
    this.interface.assertion = assertion;
};

ValidatorBuilder.prototype.scopeProperty = function(prop) {
    this.interface.scopeProps.push(prop);
};

ValidatorBuilder.prototype.property = function(prop, assertion) {
    this.interface.props[prop] = assertion;
};

ValidatorBuilder.prototype.method = function(method, fn) {
    if (!_.isFunction(fn)) {
        throw new Error("Method " + method + " body must be a function");
    }
    if (this.parentType.methods.indexOf(method) >= 0) {
        throw new Error("Method " + method + " alredy defined for type " + this.parentTypeName);
    } else if (this.interface.methods[method]) {
        throw new Error("Method " + method + " alredy defined for type " + this.name);
    }
    this.interface.methods[method] = fn;
    this.constructor.prototype[method] = ValidatorBuilder.methodCallWrapper(this, method);
};

ValidatorBuilder.prototype.onCreate = function(fn) {
    this.interface.onCreate = fn;
};

ValidatorBuilder.prototype.onValidate = function(fn) {
    this.interface.onValidate = fn;
};

ValidatorBuilder.prototype.build = function() {
    if (this.interface.scopeProps.length) {
        _.each(this.interface.scopeProps, function(prop) {
            this.scope.addProp(prop);
        }, this);
    }

    var parentType = this.parentType;
    var newTypeName = this.name;
    var newType = (function(interface) {
        return function(scope, params, schema) {
            // call super-sconstructor
            newType.base.constructor.call(this, scope, params);

            // call onCreate hook
            if (interface.onCreate) {
                interface.onCreate.call(this, scope, params);
            }

            // reproduce all concrete validator method calls, predefined by type
            (function(methods) {
                _.each(methods, function(call) {
                    this[call.name].apply(this, call.arguments);
                }, this);
            }).call(this, interface.methodCalls);

            // call schema itself
            if (schema) {
                schema.call(this);
            }
        };
    })(this.interface);

    extend(this.parentType, newType);

    newType.props = _.extend(this.interface.props, this.parentType.props);
    newType.methods = this.parentType.methods.concat(Object.keys(this.interface.methods));

    newType.prototype.name = this.name;

    _.each(this.interface.methods, function(fn, name) {
        newType.prototype[name] = fn;
    }, this);

    newType.prototype.validate = (function(interface) {
        return function(value, path, dataWrapper) {
            if (interface.assertion && !interface.assertion.call(this, value)) {
                this.scope.error("Type assertion failed for type " + newTypeName);
            }

            parentType.prototype.validate.call(this, value, path, dataWrapper);

            _.each(interface.props, function(assertion, name) {
                if (this.params[name] && !assertion.call(this, this.params[name], value, path, dataWrapper)) {
                    this.scope.error("Param assertion failed " + name + " for type " + newTypeName + "; value: " + JSON.stringify(value));
                }
            }, this);

            if (interface.onValidate) {
                interface.onValidate.call(this, value, path, dataWrapper);
            }
        };
    })(this.interface);

    this.scope.addType(newTypeName, newType);

    return this;
};
