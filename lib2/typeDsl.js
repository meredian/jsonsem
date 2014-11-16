var _ = require('lodash');
var extend = require('./extend');

var TypeDsl = module.exports = function(scope, name, props, noParentType) {
    var self = this;
    this.scope = scope;
    this.name = name;
    this.props = props;

    if (!noParentType && !props.type) {
        throw new Error("Property type missing in type parameters");
    }

    var def = this.def = {
        scope: scope,
        typeName: name,
        typeAssertion: null,
        onCreate: null,
        onValidate: null,
        props: {},
        methods: {},
        methodsCalls: {},
        parentType: noParentType ? null : scope.getType(props.type),
        parentTypeName: noParentType ? null : props.type
    };

    delete props.type;

    var ctor = function() {
        methodCallWrapper = function(name) {
            return function() {
                def.methodCalls.push({name: name, arguments: arguments});
            };
        };

        if (def.parentType) {
            _.each(def.parentType.methods, function(method) {
                this[method] = methodCallWrapper(method);
            }, this);
        }

        this.typeAssertion = function(assertion) {
            def.typeAssertion = assertion;
        };

        this.scopeProperty = function(prop) {
            def.scope.addProp(prop);
        };

        this.property = function(prop, assertion) {
            def.props[prop] = assertion;
        };

        this.onCreate = function(fn) {
            def.onCreate = fn;
        };

        this.onValidate = function(fn) {
            def.onValidate = fn;
        };

        this.method = function(method, fn) {
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
        };
    };

    this.typeDslInterface = new ctor();
};

TypeDsl.prototype.schema = function(schema) {
    schema.call(this.typeDslInterface);
    return this;
};

TypeDsl.build = function(scope, name, props, schema) {
    return new this(scope, name, props).schema(schema).build();
};

TypeDsl.prototype.buildTypeConstructor = function(def) {
    return function(scope, props, schema) {
        def.parentType.call(this, scope, props);
        if (def.onCreate) {
            def.onCreate.call(this, scope, props, schema);
        }
        if (def.methods.length) {
            _.each(methods, function(call) {
                this[call.name].apply(this, arguments);
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

        def.parentType.prototype.validate.call(this, value, path, dataWrapper);

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

TypeDsl.prototype.build = function() {
    var def = this.def;

    var newType = this.buildTypeConstructor(def);
    extend(def.parentType, newType);

    newType.builder = this;
    newType.props = _.extend(def.props, def.parentType.props);
    newType.methods = def.parentType.methods.concat(Object.keys(def.methods));

    newType.prototype.name = this.name;

    _.each(def.methods, function(fn, name) {
        newType.prototype[name] = fn;
    });

    newType.prototype.validate = this.buildTypeValidation(def);

    this.scope.addType(this.name, newType);

    return this;
};
