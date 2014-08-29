var Assertion = module.exports = function(dsl, name, fn) {
    this.dsl = dsl;
    this.name = name;
    this.fn = fn;
};

Assertion.prototype.assert = function(path, value) {
    if (!this.fn(value, path)) {
        this.dsl.error(path, "Failed assertion '" + this.name + "'; Received value: " + value);
    }
};
