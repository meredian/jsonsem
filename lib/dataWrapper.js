var _ = require('lodash');

var DataWrapper = module.exports = function(data, opts) {
    this.data = data;
    this.cachedKeys = {};
    this.opts = _.defaults(opts || {}, {
        separator: '.'
    });
};

DataWrapper.prototype.get = function(path) {
    var parent = null;
    var value = this.data;
    var key = null;
    if (path) {
        _.each(path.split(this.opts.separator), function(nextKey) {
            parent = value;
            key = (Array.isArray(value) ? parseInt(nextKey, 10) : nextKey);
            value = value[key];
        }, this);
    }
    return value;
};

DataWrapper.prototype.getKeys = function(path) {
    if (!this.cachedKeys[path]) {
        this.cachedKeys[path] = _.keys(this.get(path));
    }
    return this.cachedKeys[path];
};

DataWrapper.prototype.concatPaths = function(path, subpath) {
    if (path && subpath) {
        return "" + path + this.opts.separator + subpath;
    } else {
        return path || subpath;
    }
};
