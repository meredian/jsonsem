var _ = require('lodash');

var MemberOfRestriction = module.exports = function(dsl, source_path) {
    this.dsl = dsl;
    this.source_path = source_path;
};

MemberOfRestriction.prototype.error = function(path, msg) {
    this.dsl.errors.push([path, msg]);
};

MemberOfRestriction.prototype.check_key = function(path, key, data_wrapper) {
    if (data_wrapper.get_keys(this.source_path).indexOf(key) < 0) {
        this.error(path, "Reference to unexisting key " + key + " at path " + this.source_path);
    }
};
