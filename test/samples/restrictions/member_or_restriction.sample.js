var helper = require('./../../helper.js');
var DSL = helper.require('dsl');

describe('MemberOfRestriction', function() {
    it('validates property names are properties of referenced object', function() {
        var dsl = new DSL(function() {
            this.key('cost', {type: 'object'}, function() {
                this.each_key(this.member_of('data.resources'), {type: 'number'});
            });

            this.key('data', {type: 'object'}, function() {
                this.key('resources', {type: 'object'}, function() {
                    this.each_key(this.any(), {type: 'string'});
                });
            });
        });

        dsl.validate({
            cost: { res_1: 100 },
            data: { resources: { res_1: "Res_1 name", res_2: "Res_2 name"} }
        }).should.be.true;

        dsl.validate({
            cost: { res_3: 100 },
            data: { resources: { res_1: "Res_1 name", res_2: "Res_2 name"} }
        }).should.be.false;
    });
});
