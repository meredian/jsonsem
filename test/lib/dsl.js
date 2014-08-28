var helper = require('./../helper.js');
var DSL = helper.require('dsl');

describe('DSL', function() {
    beforeEach(function() {
        this.dsl = new DSL(function() {});
    });

    describe('#error', function() {
        it('pushes to errors array', function() {
            var path = "some.path";
            var msg = "Error occured";
            this.dsl.error(path, msg);
            this.dsl.errors.should.deep.equal([[path, msg]]);
        });
    });
});
