var path = require('path');
var chai = require('chai');
chai.should();
chai.use(require('sinon-chai'));
var sinon = exports.sinon = require('sinon');
var sandbox = exports.sandbox = null;

exports.require = function(lib_path) {
    return require(path.join(__dirname, '../lib2', lib_path));
};

beforeEach(function() {
    exports.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    exports.sandbox.restore();
});
