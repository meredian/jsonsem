var _ = require('lodash');
var TypeBuilder = require('../typeBuilder');

exports.define = function(scope) {
    TypeBuilder.build(scope, 'base', {}, function() {
        this.scopeProperty('type');
        this.onCreate(function(scope, props) {
            this.scope = scope;
            this.props = props;
            this.assertions = {};
        });

        this.method('type', function(name, props, schema) {
            TypeBuilder.build(this.scope, name, props, schema);
        });

        this.method('extend', function(name, props, schema) {
            TypeBuilder.extend(this.scope, name, props, schema);
        });

        this.onValidate(function(value, path, dataWrapper) {
            _.forOwn(this.assertions, function(assert, name) {
                if (!assert.call(this, value, path, dataWrapper)) {
                    this.scope.error(path, "Assertion " + name + " failed for value " + value);
                }
            }, this);
        });

        this.method('include', function(schema) {
            schema.call(this);
            return this;
        });

        this.method('assert', function(name, fn) {
            if (this.assertions[name]) {
                throw new Error("Assertion with name " + name + " already defined");
            }
            this.assertions[name] = fn;
        });

        this.property('inSet', function(set, value, path, dataWrapper) {
            if (set.indexOf(value) < 0) {
                scope.error(path, "Value " + value + " is not in set " + JSON.stringify(set));
            }
        });
    }, true);
};
