var _ = require('lodash');
var TypeDefinition = require('./typeDefinition');
var TypeConstructor = require('./typeConstructor');

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
};

TypeBuilder.prototype.init = function(props) {
    var parentType = props.type ? this.scope.getType(props.type) : null;
    delete props.type;

    this.def = new TypeDefinition(parentType, this.name, props);
    this.typeDsl = this.buildTypeDsl(this.def, this.scope);

    return this;
};

TypeBuilder.prototype.buildTypeDsl = function(def, scope) {
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
            scope.addProperty(prop);
        },
        property: function(prop, assertion) {
            def.addProperty(scope, prop, assertion);
        },
        onCreate: function(fn) {
            def.onCreate.push(fn);
        },
        onValidate: function(fn) {
            def.onValidate.push(fn);
        },
        method: function(method, fn) {
            console.log("Type DSL method; Name: %s; Method: %s", def.typeName, method);
            def.addMethod(scope, method, fn);
            this[method] = methodCallWrapper(method);
        }
    };

    if (def.parentType) {
        _.each(def.parentType.methodNames, function(method) {
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

    return new this(scope, name).init(props).schema(schema).build();
};

TypeBuilder.extend = function(scope, name, props, schema) {
    console.log("Type DSL extend; Name: %s", name);
    var oldType = scope.getType(name);
    var extBuilder = new TypeBuilder(scope, name);

    extBuilder.def = oldType.def.clone().setDirectExtension(oldType, props);
    extBuilder.typeDsl = extBuilder.buildTypeDsl(extBuilder.def, scope);

    var extendedType = extBuilder.schema(schema).rebuild(oldType);
    oldType.eachChild(scope, false, function(child) {
        TypeBuilder.extendFromParent(scope, extendedType, child, props);
    });
};

TypeBuilder.extendFromParent = function(scope, parentType, oldType, props) {
    console.log("Type DSL extendFromParent; Parent: %s; Type: %s", parentType.typeName, oldType.typeName);
    var extBuilder = new TypeBuilder(scope, oldType.typeName);

    extBuilder.def = oldType.def.clone().setParentExtension(parentType, oldType, props);
    extBuilder.typeDsl = extBuilder.buildTypeDsl(extBuilder.def, scope);

    var extendedType = extBuilder.rebuild(oldType);
    oldType.eachChild(scope, false, function(child) {
        TypeBuilder.extendFromParent(scope, extendedType, child, props);
    });
};

TypeBuilder.prototype.buildType = function() {
    return TypeConstructor.build(this.name, this.def);
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
