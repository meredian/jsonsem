var _ = require('lodash');

var MemberOfRestriction = module.exports = function(dsl, source_path) {
    this.dsl = dsl;
    this.source_path = source_path;
};

MemberOfRestriction.prototype.check_key = function(path, key) {
    var result = (this.keys().indexOf(key) >= 0);
    if (!result) {
        this.dsl.errors.push([path, "Reference to unexisting key " + key + " at path " + this.source_path ]);
    }
    return result;
};

MemberOfRestriction.prototype.keys = function() {
    return this.dsl.data_wrapper.get_keys(this.source_path);
};
