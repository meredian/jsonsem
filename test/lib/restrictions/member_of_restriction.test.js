var helper = require('./../../helper.js');
var MemberOfRestriction = require('./../../../lib/restrictions/member_of_restriction');
var DataWrapper = require('./../../../lib/data_wrapper');
var DSL = require('./../../../lib/dsl');

var data = {
    ref: {
        key_1: "value_1",
        key_2: "value_2",
        key_3: "value_3"
    }
};

describe('MemberOfRestriction', function() {
    beforeEach(function() {
        this.dsl = new DSL(function() {});
        this.member_of_restriction = new MemberOfRestriction(this.dsl, 'ref');
        this.data_wrapper = new DataWrapper(data);
    });

    describe('#check_key', function() {
        beforeEach(function() {
            helper.sandbox.stub(this.dsl, 'error');
        });

        it('validates correct key', function() {
            this.member_of_restriction.check_key('some.path', 'key_1', this.data_wrapper);
            this.dsl.error.should.not.be.called;
        });

        it('generates error on incorrect key', function() {
            this.member_of_restriction.check_key('some.path', 'key_4', this.data_wrapper);
            this.dsl.error.should.be.calledWith('some.path', helper.sinon.match.string);
        });
    });
});
