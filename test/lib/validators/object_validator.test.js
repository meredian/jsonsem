var helper = require('./../../helper.js');
var ObjectValidator = require('./../../../lib/validators/object_validator');
var DataWrapper = require('./../../../lib/data_wrapper');
var DSL = require('./../../../lib/dsl');

describe('ObjectValidator', function() {
    beforeEach(function() {
        this.dsl = new DSL(function() {});
        this.object_validator = new ObjectValidator(this.dsl, {}, function() {});
        this.data_wrapper = new DataWrapper({});
        helper.sandbox.spy(this.dsl, 'error');
        helper.sandbox.stub(this.dsl, 'get_validator', function(params, fn) {
            return { params: params, fn: fn };
        });
    });

    describe('#key', function() {
        it('adds new validator with expected options', function() {
            var params = {};
            var fn = function() {};
            this.object_validator.key('name', params, fn);
            this.object_validator.keys['name'].should.deep.equal({ params: params, fn: fn });
        });
    });

    describe('#optional_key', function() {
        it('adds key with "optional" flag', function() {
            this.object_validator.optional_key('name', {key: 'value'}, function(){});
            this.object_validator.keys['name'].params.optional.should.be.true;
        });
    });

    describe('#each_key', function() {
        it('adds each_key_scope restriction', function() {
            var restriction = {};
            var params = {};
            var fn = function() {};
            this.object_validator.each_key(restriction, params, fn);
            this.object_validator.each_key_scope.should.deep.equal({
                restriction: restriction, validator: { params: params, fn: fn }
            });
        });
    });
});
