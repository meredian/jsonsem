var _ = require('lodash');

var SchemaError = require('./schemaError');

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
    return _.extend(Object.create(TypeDefinition.prototype), _.cloneDeep(this));
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
        throw new SchemaError("Property assertion %s body must be a function", prop);
    }

    if (scope.hasProperty(prop)) {
        throw new SchemaError("Property %s already defined as scope current property", prop);
    } else if (this.parentType && this.parentType.hasProperty(prop)) {
        throw new SchemaError("Property %s alredy defined for type %s", prop, this.parentTypeName);
    } else if (this.propertyAssertions.hasOwnProperty(prop)) {
        throw new SchemaError("Property %s alredy defined for type %s", prop, this.typeName);
    }

    if (this.extensionType) {
        this.extensionType.eachChild(scope, true, function(child) {
            if (child.hasProperty(prop)) {
                throw new SchemaError("Property %s alredy defined for subtype %s", prop, child.typeName);
            }
        });
    }

    this.propertyAssertions[prop] = assertion;
};

TypeDefinition.prototype.addMethod = function(scope, method, fn) {
    if (!_.isFunction(fn)) {
        throw new SchemaError("Method %s body must be a function", method);
    }
    if (this.parentType && this.parentType.hasMethod(method)) {
        throw new SchemaError("Method %s alredy defined for type %s", method, this.parentTypeName);
    } else if (this.methods[method]) {
        throw new SchemaError("Method %s alredy defined for type %s", method, this.typeName);
    }
    if (this.extensionType) {
        this.extensionType.eachChild(scope, true, function(child) {
            if (child.hasMethod(method)) {
                throw new SchemaError("Method %s alredy defined for subtype %s", method, child.typeName);
            }
        });
    }
    this.methods[method] = fn;
};
