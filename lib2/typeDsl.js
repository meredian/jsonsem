var _ = require('lodash');
var clone = require('node-v8-clone').clone;
var extend = require('./extend');

var MethodProxy = function(id, name, args) {
    this.id = id;
    this.name = name;
    this.args = args;
};

MethodProxy.filterProxies = function(callstack, args) {
    return _.map(args, function(arg) {
        return (arg instanceof MethodProxy) ? callstack[arg.id] : arg;
    });
};


var TypeDsl = module.exports = function(scope, name, props) {
    var self = this;
    this.scope = scope;
    this.name = name;
    this.props = props;
};

TypeDsl.prototype.init = function() {
    this.def = this.buildDef(this.scope, this.name, this.props);
    delete this.props.type;

    this.interface = this.buildInterface(this.def);
    return this;
};

TypeDsl.prototype.buildDef = function(scope, name, props) {
    return {
        scope: scope,
        typeName: name,
        typeAssertion: null,
        onCreate: null,
        onValidate: null,
        props: {},
        methods: {},
        methodCalls: [],
        methodCallCounter: 0,
        parentType: !props.type ? null : scope.getType(props.type),
        parentTypeName: props.type || null
    };
};

TypeDsl.prototype.buildInterface = function(def) {
    var methodCallWrapper = function(name) {
        return function() {
            var proxy = new MethodProxy(++def.methodCallCounter, name, arguments);
            def.methodCalls.push(proxy);
            return proxy;
        };
    };

    var interface = {
        typeAssertion: function(assertion) {
            def.typeAssertion = assertion;
        },
        scopeProperty: function(prop) {
            def.scope.addProp(prop);
        },
        property: function(prop, assertion) {
            def.props[prop] = assertion;
        },
        onCreate: function(fn) {
            def.onCreate = fn;
        },
        onValidate: function(fn) {
            def.onValidate = fn;
        },
        method: function(method, fn) {
            if (!_.isFunction(fn)) {
                throw new Error("Method " + method + " body must be a function");
            }
            if (def.parentType && def.parentType.methods.indexOf(method) >= 0) {
                throw new Error("Method " + method + " alredy defined for type " + def.parentTypeName);
            } else if (def.methods[method]) {
                throw new Error("Method " + method + " alredy defined for type " + def.typeName);
            }
            def.methods[method] = fn;
            this[method] = methodCallWrapper(method);
        }
    };

    if (def.parentType) {
        _.each(def.parentType.methods, function(method) {
            interface[method] = methodCallWrapper(method);
        }, this);
    }

    return interface;
};

TypeDsl.prototype.schema = function(schema) {
    schema.call(this.interface);
    return this;
};

TypeDsl.build = function(scope, name, props, schema, noParentType) {
    if (!noParentType && !props.type) {
        throw new Error("Property type missing in type parameters");
    }

    return new this(scope, name, props).init().schema(schema).build();
};

TypeDsl.extend = function(scope, name, props, schema) {
    var type = scope.getType(name);
    var builder = type.builder;
    var extBuilder = new TypeDsl(scope, name, builder.props);
    extBuilder.def = clone(builder.def, true);
    extBuilder.interface = extBuilder.buildInterface(extBuilder.def);
    extBuilder.schema(schema).rebuild();
};

TypeDsl.prototype.buildTypeConstructor = function(def) {
    return function(scope, props, schema) {
        if (def.parentType) {
            def.parentType.call(this, scope, props);
        }
        if (def.onCreate) {
            def.onCreate.call(this, scope, props, schema);
        }
        if (def.methodCalls.length) {
            var callstack = {};
            _.each(def.methodCalls, function(proxy) {
                callstack[proxy.id] = this[proxy.name].apply(this, MethodProxy.filterProxies(callstack, proxy.args));
            }, this);
        }
        if (schema) {
            schema.call(this);
        }
    };
};

TypeDsl.prototype.buildTypeValidation = function(def) {
    return function(value, path, dataWrapper) {
        if (def.typeAssertion && !def.typeAssertion.call(this, value)) {
            this.scope.error("Type assertion failed for type " + def.typeName);
        }

        if (def.parentType) {
            def.parentType.prototype.validate.call(this, value, path, dataWrapper);
        }

        _.each(def.props, function(assertion, name) {
            if (this.props.hasOwnProperty(name) && !assertion.call(this, this.props[name], value, path, dataWrapper)) {
                this.scope.error("Param assertion failed " + name + " for type " + def.typeName + "; value: " + JSON.stringify(value));
            }
        }, this);

        if (def.onValidate) {
            def.onValidate.call(this, value, path, dataWrapper);
        }
    };
};

TypeDsl.prototype.buildType = function() {
    var def = this.def;

    var newType = this.buildTypeConstructor(def);

    if (def.parentType) {
        extend(def.parentType, newType);
        newType.parent = def.parentType;
        newType.props = _.extend(def.props, def.parentType.props);
        newType.methods = def.parentType.methods.concat(Object.keys(def.methods));
    } else {
        newType.parent = null;
        newType.props = def.props;
        newType.methods = Object.keys(def.methods);
    }

    newType.children = {};
    newType.builder = this;

    newType.prototype.name = this.name;

    _.each(def.methods, function(fn, name) {
        newType.prototype[name] = fn;
    });

    newType.prototype.validate = this.buildTypeValidation(def);

    return newType;
};

TypeDsl.prototype.build = function() {
    var newType = this.buildType();
    this.scope.addType(this.name, newType);

    return this;
};

TypeDsl.prototype.rebuild = function() {
    var newType = this.buildType();
    this.scope.rewriteType(this.name, newType);
    return this;
};
