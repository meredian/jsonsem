var chai = require('chai');
chai.should();
chai.use(require('sinon-chai'));
var sinon = exports.sinon = require('sinon');
var sandbox = exports.sandbox = null;

beforeEach(function() {
    exports.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    exports.sandbox.restore();
});