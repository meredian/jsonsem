var helper = require('./../helper.js');
var DSL = helper.require('dsl');

describe('Type inheritance and overriding', function() {
    var schema = function() {
        this.type('type_1', {type: 'object'}, function() {
            this.method('hohoho', function(txt) { console.log("TYPE 1 METHOD CALL"); });
        });

        this.type('type_2', {type: 'type_1'}, function() {
        });

        this.key('type_2', {type: 'type_2'}, function() {
            this.extend('number', {}, function() {
                this.method('hohoho', function(txt) { });
            });
            this.key('int', {type: 'int'}, function() {
                this.hohoho("EXTENDED BASE CLASS!");
            });
        });

        // this.hohoho("NOT EXTENDED IN THIS SCOPE, WILL THROW!");
    };

    var json = {
        type_2: {
            int: 10
        }
    };

    it('validates JSON with no errors', function() {
        var dsl = new DSL().schema(schema);
        dsl.validate(json).should.be.true;
    });
});
