var helper = require('./../helper.js');
var DSL = require('./../../lib/dsl');

describe('JSON schema', function() {
    var schema = function() {
        this.key('name', {type: 'string'});
        this.key('level', {type: 'number'});

        this.key('resources', {type: 'object'}, function() {
            this.each_key(this.any(), {type: 'object'}, function() {
                this.key('name', {type: 'string'});
                this.key('description', {type: 'string'});
                this.other_keys_restricted();
            });
        });

        this.type('resources', {type: 'object'}, function() {
            this.each_key(this.member_of('resources'), {type: 'number'});
        });

        this.key('buildings', {type: 'object'}, function() {
            this.each_key(this.any(), {type: 'object'}, function() {
                this.key('name', {type: 'string'});
                this.key('cost', {type: 'resources'});
                this.optional_key('resource_production', {type: 'resources'});
                this.other_keys_restricted();
            });
        });

        this.key('levels', {type: 'array'}, function() {
            this.each_index({type: 'array'}, function() {
                this.index(0, {type: 'number'});
                this.optional_index(1, {type: 'string'});
                this.other_indexes_restricted();
            });
        });
    };

    var json = {
        name: "Mr Smith",
        level: 10,
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
        },

        levels: [
            [20, 'First one'],
            [50]
        ]
    };

    it('validates JSON with no errors', function() {
        var dsl = new DSL(schema);
        dsl.validate(json).should.be.true;
    });
});
