var helper = require('./../helper.js');
var DataWrapper = require('./../../lib/data_wrapper');

var separator = '$';
var data = {
    a: {
        b: {
            c: 'value'
        },
        bb: {}
    },
    arr: [
        'value_0',
        'value_1'
    ]
};

describe('DataWrapper', function() {
    beforeEach(function() {
        this.data_wrapper = new DataWrapper(data, {
            separator: separator
        });
    });

    describe('#get', function() {
        it('returns root object if no path specified', function() {
            this.data_wrapper.get().should.equal(data);
        });

        it('returns value by path', function() {
            this.data_wrapper.get('a$b').should.equal(data.a.b)
        });

        it('returns value by path with array index', function() {
            this.data_wrapper.get('arr$0').should.equal(data.arr[0]);
        });
    });

    describe('#get_keys', function() {
        it('returns keys by path', function() {
            this.data_wrapper.get_keys('a').should.deep.equal(['b', 'bb']);
        });
        it('caches keys', function() {
            helper.sandbox.spy(this.data_wrapper, "get");
            this.data_wrapper.get_keys('arr');
            this.data_wrapper.get_keys('arr');
            this.data_wrapper.get.should.be.calledOnce;
        });
    });

    describe('#concat_paths', function() {
        it('joins path and subpath using correct separator', function() {
            this.data_wrapper.concat_paths("a$b", "c").should.equal("a$b$c");
        });
        it('returns path if subpath is empty', function() {
            this.data_wrapper.concat_paths("a$b").should.equal("a$b");
        });
        it('returns subpath if path is empty', function() {
            this.data_wrapper.concat_paths("", "a").should.equal("a");
        });
    });
});
