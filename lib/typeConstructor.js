var _ = require('lodash');
var util = require('util');

var TypeConstructor = module.exports = {};

var typeStaticMethods = {
    hasProperty: function(propertyName) {
        return this.propertyNames.indexOf(propertyName) >= 0;
    },
    hasMethod: function(methodName) {
        return this.methodNames.indexOf(methodName) >= 0;
    },
    addChild: function(name) {
        this.children[name] = true;
    },
    eachChild: function(scope, deep, cb) {
        _.forOwn(this.children, function(exists, name) {
            var child = scope.getTypeOrNull(name);
            if (child) {
                cb(child);
                if (deep) {
                    child.eachChild(scope, deep, cb);
                }
            }
        });
    }
};

TypeConstructor.build = function(typeName, def) {
    var newType = this.buildTypeConstructor(def);
    var parent = def.parentType;

    var hasParent = !!def.parentType;
    if (hasParent) {
        util.inherits(newType, parent);
        parent.addChild(typeName);

        newType.propertyAssertions = def.propertyAssertions;
        newType.propertyNames = Object.keys(def.propertyAssertions).concat(parent.propertyNames);
        newType.methodNames = Object.keys(def.methods).concat(parent.methodNames);
    } else {
        newType.propertyAssertions = def.propertyAssertions;
        newType.propertyNames = Object.keys(def.propertyAssertions);
        newType.methodNames = Object.keys(def.methods);
    }

    newType.def = def;
    newType.children = {};
    newType.props = def.props;

    _.forOwn(typeStaticMethods, function(method, name) {
        newType[name] = method;
    });

    newType.prototype.validate = this.buildTypeValidation(def);
    newType.prototype.typeName = newType.typeName = typeName;

    _.forOwn(def.methods, function(fn, name) {
        newType.prototype[name] = fn;
    });

    return newType;

};

TypeConstructor.buildTypeConstructor = function(def) {
    return function(scope, props, schema) {
        if (def.parentType) {
            def.parentType.call(this, scope, props);
        }
        if (def.onCreate.length) {
            _.each(def.onCreate, function(fn) {
                fn.call(this, scope, props, schema);
            }, this);
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

TypeConstructor.buildTypeValidation = function(def) {
    return function(value, path, dataWrapper) {
        if (def.typeAssertion && !def.typeAssertion.call(this, value)) {
            return this.scope.error(path, "Type assertion failed for type " + this.typeName);
        }

        if (def.parentType) {
            def.parentType.prototype.validate.call(this, value, path, dataWrapper);
        }

        _.forOwn(def.propertyAssertions, function(assertion, name) {
            if (assertion && this.props.hasOwnProperty(name) && !assertion.call(this, this.props[name], value, path, dataWrapper)) {
                this.scope.error(path, "Param assertion " + name + " failed for type " + this.typeName + "; value: " + JSON.stringify(value));
            }
        }, this);

        if (def.onValidate.length) {
            _.each(def.onValidate, function(fn) {
                fn.call(this, value, path, dataWrapper);
            }, this);
        }
    };
};
