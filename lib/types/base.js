var TypeBuilder = require('../typeBuilder');

exports.define = function(scope) {
    TypeBuilder.build(scope, 'base', {}, function() {
        this.scopeProperty('type');
        this.onCreate(function(scope, props) {
            this.scope = scope;
            this.props = props;
        });
        this.method('type', function(name, props, schema) {
            TypeBuilder.build(this.scope, name, props, schema);
        });
        this.method('extend', function(name, props, schema) {
            TypeBuilder.extend(this.scope, name, props, schema);
        });
        this.onValidate(function(value, path, dataWrapper) {
            console.log('Validating path "%s"; type: %s', path || '', this.typeName);
        });
        this.method('include', function(schema) {
            schema.call(this);
            return this;
        });
    }, true);
};
