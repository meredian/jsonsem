var _ = require('lodash');
var extend = require('./extend');
var TypeDsl = require('./typeDsl');

var TypeBuilder = module.exports = function(scope, name, props) {
    this.scope = scope;
    this.name = name;
    this.typeDsl = new TypeDsl(scope, name, props);
};

TypeBuilder.build = function(scope, name, props, schema) {
    return new this(scope, name, props).schema(schema).build();
};

TypeBuilder.prototype.schema = function(schema) {
    this.typeDsl.schema(schema);
    return this;
};

TypeBuilder.prototype.buildTypeConstructor = function(def) {
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

TypeBuilder.prototype.buildTypeValidation = function(def) {
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

TypeBuilder.prototype.build = function() {
    var def = this.typeDsl.def;

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
