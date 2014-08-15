var helper = require('./../../helper.js');
var DSL = require('./../../../lib/dsl');

describe('ObjectValidator', function() {
    it('validates property presence', function() {
        var dsl = new DSL(function() {
            this.key('data', {type: 'object'}, function() {});
        });

        dsl.validate({data: {}}).should.be.true;
        dsl.validate({data: undefined}).should.be.false;
        dsl.validate({}).should.be.false;
    });

    it('validates property type', function() {
        var dsl = new DSL(function() {
            this.key('data', {type: 'object'}, function() {});
        });

        dsl.validate({data: { name: "John" }}).should.be.true;
        dsl.validate({data: "John"}).should.be.false;
        dsl.validate({data: 123}).should.be.false;
    });

    it('validates optional property only if present', function() {
        var dsl = new DSL(function() {
            this.optional_key('name', {type: 'string'});
        });

        dsl.validate({name: "John"}).should.be.true;
        dsl.validate({data: "Data"}).should.be.true;
        dsl.validate({name: {}}).should.be.false;
    });

    it('validates all properties if each_key validator set up', function() {
        var dsl = new DSL(function() {
            this.each_key(this.any(), {type: 'string'});
        });

        dsl.validate({name: "John", id: "123"}).should.be.true;
        dsl.validate({name: "John", id: 123}).should.be.false;
    });

    it('rejects non-explicit keys if other_keys_restricted flag raised', function() {
        var dsl = new DSL(function() {
            this.key('name', {type: 'string'});
            this.other_keys_restricted();
        });

        dsl.validate({name: "John"}).should.be.true;
        dsl.validate({name: "John", id: 123}).should.be.false;
    });

    it('validates custom assertions', function() {
        var dsl = new DSL(function() {
            this.assert('is_mystical_enough', function(value) {
                return value.name === "Assertion mystics";
            });
        });

        dsl.validate({name: "John"}).should.be.false;
        dsl.validate({name: "Assertion mystics"}).should.be.true;
    });

    it('validates parameter-passed custom assertions', function() {
        var dsl = new DSL(function() {
            var is_long_string = function(value) {
                return value.length > 10;
            };
            this.key('name', {type: 'string', assert: is_long_string});
        });

        dsl.validate({name: "John"}).should.be.false;
        dsl.validate({name: "John the first of his name"}).should.be.true;
    });

    it('validates both parameter-passed and direct assertions', function() {
        var dsl = new DSL(function() {
            var has_some_keys = function(value) {
                return Object.keys(value).length > 1;
            };
            this.key('obj', {type: 'object', assert: has_some_keys}, function() {
                this.assert('has_not_too_many_keys', function(value) {
                    return Object.keys(value).length < 3;
                });
            });
        });

        dsl.validate({obj: {a: 1, b: 2}}).should.be.true;
        dsl.validate({obj: {a: 1}}).should.be.false;
        dsl.validate({obj: {a: 1, b: 2, c: 3}}).should.be.false;
    });
});
