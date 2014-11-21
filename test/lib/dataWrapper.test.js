var helper = require('./../helper.js');
var DataWrapper = helper.require('dataWrapper');

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
        this.dataWrapper = new DataWrapper(data, {
            separator: separator
        });
    });

    describe('#get', function() {
        it('returns root object if no path specified', function() {
            this.dataWrapper.get().should.equal(data);
        });

        it('returns value by path', function() {
            this.dataWrapper.get('a$b').should.equal(data.a.b);
        });

        it('returns value by path with array index', function() {
            this.dataWrapper.get('arr$0').should.equal(data.arr[0]);
        });
    });

    describe('#getKeys', function() {
        it('returns keys by path', function() {
            this.dataWrapper.getKeys('a').should.deep.equal(['b', 'bb']);
        });
        it('caches keys', function() {
            helper.sandbox.spy(this.dataWrapper, "get");
            this.dataWrapper.getKeys('arr');
            this.dataWrapper.getKeys('arr');
            this.dataWrapper.get.should.be.calledOnce;
        });
    });

    describe('#concatPaths', function() {
        it('joins path and subpath using correct separator', function() {
            this.dataWrapper.concatPaths("a$b", "c").should.equal("a$b$c");
        });
        it('returns path if subpath is empty', function() {
            this.dataWrapper.concatPaths("a$b").should.equal("a$b");
        });
        it('returns subpath if path is empty', function() {
            this.dataWrapper.concatPaths("", "a").should.equal("a");
        });
    });
});
