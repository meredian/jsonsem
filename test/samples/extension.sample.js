var helper = require('./../helper.js');
var DSL = helper.require('dsl');

describe('Type inheritance and overriding', function() {
    var schema = function() {
        this.type('type_1', {type: 'object'}, function() {

        });

        this.type('type_2', {type: 'object'}, function() {

        });


        this.type('type_3', {type: 'type_2'}, function() {
            this.method('ololo', function(txt) { console.log("NOT OVERRIDED"); });
        });

        this.key('type_2', {type: 'type_3'}, function() {
            this.extend('number', {}, function() {
                this.property('min', function(min, value) {
                    return min <= value;
                });
                this.property('max', function(max, value) {
                    return max >= value;
                });
                this.method('hohoho', function(txt) { console.log(txt); });
            });
            this.ololo("OVERRIDED");
            this.key('int', {type: 'int', min: 2, max: 12}, function() {
                this.hohoho("EXTENDED BASE CLASS!");
            });
        });

        // this.hohoho("NOT EXTENDED IN THIS SCOPE, WILL THROW!");
    };

    var json = {
        type_2: {
            int: 10
        },
    };

    it('validates JSON with no errors', function() {
        var dsl = new DSL().schema(schema);
        dsl.validate(json).should.be.true;
    });
});
