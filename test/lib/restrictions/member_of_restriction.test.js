var helper = require('./../../helper.js');
var MemberOfRestriction = require('./../../../lib/restrictions/member_of_restriction');
var DataWrapper = require('./../../../lib/data_wrapper');

var data = {
    ref: {
        key_1: "value_1",
        key_2: "value_2",
        key_3: "value_3"
    }
};

describe('DataWrapper', function() {
    beforeEach(function() {
        this.dsl = { errors: [] };
        this.member_of_restriction = new MemberOfRestriction(this.dsl, 'ref')
        this.data_wrapper = new DataWrapper(data);
    });

    describe('#check_key', function() {
        beforeEach(function() {
            helper.sandbox.stub(this.member_of_restriction, 'error');
        })

        it('validates correct key', function() {
            this.member_of_restriction.check_key('some.path', 'key_1', this.data_wrapper);
            this.member_of_restriction.error.should.not.be.called;
        });

        it('generates error on incorrect key', function() {
            this.member_of_restriction.check_key('some.path', 'key_4', this.data_wrapper);
            this.member_of_restriction.error.should.be.calledWith('some.path', helper.sinon.match.string);
        });
    });

    describe('#error', function() {
        it('pushes error to dsl', function() {
            this.member_of_restriction.error('path', 'msg');
            this.dsl.errors.should.deep.equal([['path', 'msg']]);
        });
    });
});
