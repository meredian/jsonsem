var InSetRestriction = module.exports = function(dsl, set) {
    this.dsl = dsl;
    this.set = set;
};

InSetRestriction.prototype.check_key = function(path, key, data_wrapper) {
    if (this.set.indexOf(key) < 0) {
        this.dsl.error(path, "Key " + key + " is not in set " + this.set );
    }
};
