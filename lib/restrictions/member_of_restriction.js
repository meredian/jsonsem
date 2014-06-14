var MemberOfRestrinction = module.exports = function(dsl, path) {
    this.dsl = dsl;
    this.path = path;
};

MemberOfRestrinction.prototype.check_key = function(key, validation_path) {
    var result = (this.keys().indexOf(key) >= 0);
    if (!result) {
        this.dsl.errors.push([validation_path, "Reference to unexisting " + key + " at path " + this.path ]);
    }
    return result;
};

MemberOfRestrinction.prototype.keys = function() {
    return [];
};
