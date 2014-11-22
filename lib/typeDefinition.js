var _ = require('lodash');
var clone = require('node-v8-clone').clone;

var TypeDefinition = module.exports = function(parentType, typeName, props) {
    this.typeName = typeName;
    this.typeAssertion = null;
    this.onCreate = [];
    this.onValidate = [];

    this.props = parentType ? _.defaults(props, parentType.props) : props;
    this.ownProps = props;

    this.propertyAssertions = {};
    this.methods = {};

    this.methodCalls = [];
    this.methodCallCounter = 0;

    this.parentType = parentType;
    this.parentTypeName = parentType && parentType.typeName;
    this.extensionType = null;
};

TypeDefinition.prototype.clone = function() {
    return clone(this, true);
};

TypeDefinition.prototype.setDirectExtension = function(extensionType, props) {
    this.extensionType = extensionType;

    this.ownProps = _.defaults(props, this.ownProps);
    this.props = _.defaults(this.ownProps, this.props);
    return this;
};

TypeDefinition.prototype.setParentExtension = function(parentType, extensionType, props) {
    this.extensionType = extensionType;
    this.parentType = parentType;
    this.parentTypeName = parentType.typeName;

    this.ownProps = _.defaults(this.ownProps, props);
    this.props = _.defaults(this.ownProps, props, this.props);
    return this;
};

TypeDefinition.prototype.addProperty = function(scope, prop, assertion) {
    if (!assertion) {
        assertion = false;
    } else if (!_.isFunction(assertion)) {
        throw new Error("Property assertion " + prop + " body must be a function");
    }

    if (scope.hasProperty(prop)) {
        throw new Error("Property " + prop + " already defined as scope current property");
    } else if (this.parentType && this.parentType.hasProperty(prop)) {
        throw new Error("Property " + prop + " alredy defined for type " + this.parentTypeName);
    } else if (this.propertyAssertions.hasOwnProperty(prop)) {
        throw new Error("Property " + prop + " alredy defined for type " + this.typeName);
    }

    if (this.extensionType) {
        this.extensionType.eachChild(scope, true, function(child) {
            if (child.hasProperty(prop)) {
                throw new Error("Property " + prop + " alredy defined for subtype " + child.typeName);
            }
        });
    }

    this.propertyAssertions[prop] = assertion;
};

TypeDefinition.prototype.addMethod = function(scope, method, fn) {
    if (!_.isFunction(fn)) {
        throw new Error("Method " + method + " body must be a function");
    }
    if (this.parentType && this.parentType.hasMethod(method)) {
        throw new Error("Method " + method + " alredy defined for type " + this.parentTypeName);
    } else if (this.methods[method]) {
        throw new Error("Method " + method + " alredy defined for type " + this.typeName);
    }
    if (this.extensionType) {
        this.extensionType.eachChild(scope, true, function(child) {
            if (child.hasMethod(method)) {
                throw new Error("Method " + method + " alredy defined for subtype " + child.typeName);
            }
        });
    }
    this.methods[method] = fn;
};
