var _ = require('lodash');
var clone = require('node-v8-clone').clone;
var extend = require('./extend');

var MethodProxy = function(id, name, args) {
    this.id = id;
    this.name = name;
    this.args = args;
};

MethodProxy.prototype.filteredArgs = function(callstack) {
    return _.map(this.args, function(arg) {
        return (arg instanceof MethodProxy) ? callstack[arg.id] : arg;
    });
};

var TypeBuilder = module.exports = function(scope, name, props) {
    var self = this;
    this.scope = scope;
    this.name = name;
    this.props = props;
};

TypeBuilder.prototype.init = function() {
    this.def = this.buildDef(this.scope, this.name, this.props);
    delete this.props.type;

    this.typeDsl = this.buildTypeDsl(this.def);
    return this;
};

TypeBuilder.prototype.buildDef = function(scope, name, props) {
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
        parentTypeName: props.type || null,
        extensionType: null
    };
};

TypeBuilder.prototype.buildTypeDsl = function(def) {
    var methodCallWrapper = function(name) {
        return function() {
            var proxy = new MethodProxy(++def.methodCallCounter, name, arguments);
            def.methodCalls.push(proxy);
            return proxy;
        };
    };

    var typeDsl = {
        typeAssertion: function(assertion) {
            def.typeAssertion = assertion;
        },
        scopeProperty: function(prop) {
            def.scope.addProp(prop);
        },
        property: function(prop, assertion) {
            if (def.extensionType) {
                def.extensionType.eachChildInScope(def.scope, true, function(child) {
                    if (child.props[prop]) {
                        throw new Error("Property " + prop + " alredy define for subtype " + child.typeName);
                    }
                });
            }

            def.props[prop] = assertion;
        },
        onCreate: function(fn) {
            def.onCreate = fn;
        },
        onValidate: function(fn) {
            def.onValidate = fn;
        },
        method: function(method, fn) {
            console.log("Type DSL method; Name: %s; Method: %s", def.typeName, method)
            if (!_.isFunction(fn)) {
                throw new Error("Method " + method + " body must be a function");
            }
            if (def.parentType && def.parentType.methods.indexOf(method) >= 0) {
                throw new Error("Method " + method + " alredy defined for type " + def.parentTypeName);
            } else if (def.methods[method]) {
                throw new Error("Method " + method + " alredy defined for type " + def.typeName);
            }
            if (def.extensionType) {
                def.extensionType.eachChildInScope(def.scope, true, function(child) {
                    if (child.methods.indexOf(method) >= 0) {
                        throw new Error("Method " + method + " alredy define for subtype " + child.typeName);
                    }
                });
            }
            def.methods[method] = fn;
            this[method] = methodCallWrapper(method);
        }
    };

    if (def.parentType) {
        _.each(def.parentType.methods, function(method) {
            typeDsl[method] = methodCallWrapper(method);
        }, this);
    }

    return typeDsl;
};

TypeBuilder.prototype.schema = function(schema) {
    schema.call(this.typeDsl);
    return this;
};

TypeBuilder.build = function(scope, name, props, schema, noParentType) {
    console.log("Type DSL build; Name: %s", name);
    if (!noParentType && !props.type) {
        throw new Error("Property type missing in type parameters");
    }

    return new this(scope, name, props).init().schema(schema).build();
};

TypeBuilder.extend = function(scope, name, props, schema) {
    console.log("Type DSL extend; Name: %s", name);
    var oldType = scope.getType(name);
    var builder = oldType.builder;
    var extBuilder = new TypeBuilder(scope, name, builder.props);
    extBuilder.def = clone(builder.def, true);
    extBuilder.def.scope = scope;
    extBuilder.def.extensionType = oldType;
    extBuilder.typeDsl = extBuilder.buildTypeDsl(extBuilder.def);
    var extendedType = extBuilder.schema(schema).rebuild(oldType);
    oldType.eachChildInScope(scope, false, function(child) {
        TypeBuilder.extendFromParent(scope, extendedType, child, props);
    });
};

TypeBuilder.extendFromParent = function(scope, parentType, oldType, props) {
    console.log("Type DSL extendFromParent; Parent: %s; Type: %s", parentType.typeName, oldType.typeName);
    var builder = oldType.builder;
    var extBuilder = new TypeBuilder(scope, oldType.typeName, builder.props);
    extBuilder.def = clone(builder.def, true);
    extBuilder.def.scope = scope;
    extBuilder.def.extensionType = oldType;
    extBuilder.def.parentType = parentType;
    extBuilder.def.parentTypeName = parentType.name;
    var extendedType = extBuilder.rebuild(oldType);
    oldType.eachChildInScope(scope, false, function(child) {
        TypeBuilder.extendFromParent(scope, extendedType, child, props);
    });
};

TypeBuilder.prototype.buildTypeConstructor = function(def) {
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
                callstack[proxy.id] = this[proxy.name].apply(this, proxy.filteredArgs(callstack));
            }, this);
        }
        if (schema) {
            schema.call(this);
        }
    };
};

TypeBuilder.prototype.buildTypeValidation = function(def) {
    return function(value, path, dataWrapper) {
        if (def.typeAssertion && !def.typeAssertion.call(this, value)) {
            return this.scope.error(path, "Type assertion failed for type " + def.typeName);
        }

        if (def.parentType) {
            def.parentType.prototype.validate.call(this, value, path, dataWrapper);
        }

        _.each(def.props, function(assertion, name) {
            if (assertion && this.props.hasOwnProperty(name) && !assertion.call(this, this.props[name], value, path, dataWrapper)) {
                this.scope.error(path, "Param assertion failed " + name + " for type " + def.typeName + "; value: " + JSON.stringify(value));
            }
        }, this);

        if (def.onValidate) {
            def.onValidate.call(this, value, path, dataWrapper);
        }
    };
};

TypeBuilder.prototype.buildChildInScopeIterrator = function() {
    return function(scope, deep, cb) {
        if (this.children.length) {
            var childrenNames = _.pluck(this.children, 'typeName');
            _.each(childrenNames, function(childName) {
                console.log("Child name: %s", childName);
                var child = scope.getTypeOrNull(childName);
                console.log("Child in scope: %s", child && child.typeName);
                if (child) {
                    cb(child);
                    if (deep) {
                        child.eachChildInScope(scope, deep, cb);
                    }
                }
            });
        }
    };
};

TypeBuilder.prototype.buildType = function() {
    var def = this.def;

    var newType = this.buildTypeConstructor(def);

    if (def.parentType) {
        extend(def.parentType, newType);
        def.parentType.children.push(newType);
        newType.parent = def.parentType;
        newType.props = _.extend(def.props, def.parentType.props);
        newType.methods = def.parentType.methods.concat(Object.keys(def.methods));
    } else {
        newType.parent = null;
        newType.props = def.props;
        newType.methods = Object.keys(def.methods);
    }

    newType.children = [];
    newType.builder = this;
    newType.scope = this.scope;

    newType.eachChildInScope = this.buildChildInScopeIterrator();

    newType.prototype.typeName = newType.typeName = this.name;

    _.each(def.methods, function(fn, name) {
        newType.prototype[name] = fn;
    });

    newType.prototype.validate = this.buildTypeValidation(def);

    return newType;
};

TypeBuilder.prototype.build = function() {
    var newType = this.buildType();
    this.scope.addType(this.name, newType);
    return newType;
};

TypeBuilder.prototype.rebuild = function(oldType) {
    var newType = this.buildType();
    this.scope.rewriteType(this.name, newType);
    return newType;
};
