var helper = require('./../helper.js');
var DSL = helper.require('dsl');

describe('JSON schema', function() {
    var schema = function() {
        this.key('name', {type: 'string'});
        this.key('level', {type: 'uint'});
        this.key('human', {type: 'boolean'});

        this.key('resources', {type: 'object'}, function() {
            this.eachKey(this.any(), {type: 'object'}, function() {
                this.key('name', {type: 'string'});
                this.key('description', {type: 'string'});
            });
        });

        this.type('resources', {type: 'object'}, function() {
            this.eachKey(this.keyOf('resources'), {type: 'number'});
        });

        this.key('buildings', {type: 'object'}, function() {
            this.eachKey(this.any(), {type: 'object'}, function() {
                this.key('name', {type: 'string'});
                this.key('cost', {type: 'resources'});
                this.optionalKey('resource_production', {type: 'resources'});
            });
        });
    };

    var json = {
        name: "Mr Smith",
        level: 10,
        human: true,
        resources: {
            gold: {
                name: 'Gold',
                description: 'Most usefull thing in this lands'
            },
            wood: {
                name: 'Iron Wood',
                description: "Can be used to build houses"
            }
        },

        buildings: {
            pub: {
                name: 'Old drinking pub',
                cost: {gold: 100, wood: 1000}
            },
            golden_mine: {
                name: "Golden mine",
                cost: {gold: 500, wood: 200},
                resource_production: {gold: 1000}
            }
        }
    };

    it('validates JSON with no errors', function() {
        var dsl = new DSL().schema(schema);
        dsl.validate(json).should.be.true;
    });
});
