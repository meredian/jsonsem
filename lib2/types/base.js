var TypeDsl = require('../typeDsl');

exports.define = function(scope) {
    TypeDsl.build(scope, 'base', {}, function() {
        this.scopeProperty('type');
        this.onCreate(function(scope, props) {
            this.scope = scope;
            this.props = props;
        });
        this.method('type', function(name, props, schema) {
            TypeDsl.build(this.scope, name, props, schema);
        });
        this.method('extend', function(name, props, schema) {
            TypeDsl.extend(this.scope, name, props, schema);
        });
        this.onValidate(function(value, path, dataWrapper) {
            console.log('Validating path "%s"', path || '');
        });
        this.method('include', function(schema) {
            schema.call(this);
            return this;
        });
    }, true);
};
