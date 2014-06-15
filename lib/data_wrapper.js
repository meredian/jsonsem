var _ = require('lodash');

var DataWrapper = module.exports = function(data, opts) {
    this.data = data;
    this.cached_keys = {};
    this.opts = _.defaults(opts || {}, {
        separator: '.'
    });
};

DataWrapper.prototype.get = function(path) {
    var parent = null;
    var value = this.data;
    var key = null;
    if (path) {
        _.each(path.split(this.opts.separator), function(next_key) {
            parent = value;
            key = (_.isArray(value) ? parseInt(next_key, 10) : next_key);
            value = value[key];
        }, this)
    }
    return value;
};

DataWrapper.prototype.get_keys = function(path) {
    if (!this.cached_keys[path]) {
        this.cached_keys[path] = _.keys(this.get(path));
    }
    return this.cached_keys[path];
}

DataWrapper.prototype.concat_paths = function(path, subpath) {
    if (path && subpath) {
        return "" + path + this.opts.separator + subpath;
    } else {
        return path || subpath;
    }
};
