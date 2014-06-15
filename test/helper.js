var chai = require('chai');
chai.should();
chai.use(require('sinon-chai'));
var sinon = require('sinon');
var sandbox = exports.sinon = null;

beforeEach(function() {
    exports.sinon = sinon.sandbox.create();
});

afterEach(function() {
    exports.sinon.restore();
});