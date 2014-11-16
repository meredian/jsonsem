var _ = require('lodash');

var TypeDsl = module.exports = function(scope, name, props) {
    var self = this;
    this.scope = scope;
    this.name = name;
    this.props = props;

    if (!props.type) {
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
        parentType: scope.getType(props.type),
        parentTypeName: props.type
    };

    delete props.type;

    var ctor = function() {
        methodCallWrapper = function(name) {
            return function() {
                def.methodCalls.push({name: name, arguments: arguments});
            };
        };

        _.each(def.parentType.methods, function(method) {
            this[method] = methodCallWrapper(method);
        }, this);

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
            if (def.parentType.methods.indexOf(method) >= 0) {
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
