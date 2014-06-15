var MemberOfRestrinction = module.exports = function(dsl, source_path) {
    this.dsl = dsl;
    this.source_path = source_path;
};

MemberOfRestrinction.prototype.check_key = function(path, key) {
    var result = (this.keys().indexOf(key) >= 0);
    if (!result) {
        this.dsl.errors.push([path, "Reference to unexisting key " + key + " at path " + this.source_path ]);
    }
    return result;
};

MemberOfRestrinction.prototype.keys = function() {
    return [];
};
