var Scope = require('./scope');
var BaseValidator = require('./baseValidator');
var DataWrapper = require('./dataWrapper');

var DSL = module.exports = function(schema) {
    this.rootScope = new Scope(this);
    this.rootScope.addProp('type');
    this.rootScope.addType('base', BaseValidator);

    new BaseValidator(this.rootScope, {})
    .include(require('./types/object'))
    .include(require('./types/string'));

    var ObjectValidator = this.rootScope.getType('object');
    this.rootValidator = new ObjectValidator(this.rootScope, {}, schema);
};

DSL.prototype.validate = function(json) {
    this.rootValidator.validate(json, null, new DataWrapper(json));
};

var dsl = new DSL(function() {
    this.key('obj', {type: 'object'});
    this.key('name', {type: 'string', length: 4});
});

dsl.validate({
    obj: {},
    name: 12
});
