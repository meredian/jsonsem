var AnyRestriction = module.exports = function() {};

AnyRestriction.prototype.check_key = function() {
    return true;
};

AnyRestriction.prototype.keys = function() {
    return [];
};
