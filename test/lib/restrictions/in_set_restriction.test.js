var helper = require('./../../helper.js');
var InSetRestriction = helper.require('restrictions/in_set_restriction');
var DataWrapper = helper.require('data_wrapper');
var DSL = helper.require('dsl');

describe('InSetRestriction', function() {
    beforeEach(function() {
        this.dsl = new DSL(function() {});
        this.in_set_restriction = new InSetRestriction(this.dsl, ['key_1', 'key_2']);
        this.data_wrapper = new DataWrapper({});
    });

    describe('#check_key', function() {
        beforeEach(function() {
            helper.sandbox.stub(this.dsl, 'error');
        });

        it('validates correct key', function() {
            this.in_set_restriction.check_key('some.path', 'key_1', this.data_wrapper);
            this.dsl.error.should.not.be.called;
        });

        it('generates error on incorrect key', function() {
            this.in_set_restriction.check_key('some.path', 'key_3', this.data_wrapper);
            this.dsl.error.should.be.calledWith('some.path', helper.sinon.match.string);
        });
    });
});
