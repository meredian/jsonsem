var DSL = require('../lib/dsl');
var schema = function() {
    this.key('user_id', {type: 'uint'});
    this.key('name', {type: 'string'});
    this.key('accounts', {type: 'object'}, function() {
        this.eachKey(this.inSet(['MM', 'FB', 'VK', 'OK']), {type: 'uint'});
    });
};

var validator = new DSL().schema(schema);

module.exports = {
    name: "Validation small objects",
    cases: {
        "Validating correct object": function() {
            validator.validate({
                user_id: 123,
                name: "John",
                accounts: {
                    FB: 123,
                    OK: 100002
                }
            });
        },
        "Validating incorrect object": function() {
            validator.validate({
                user_id: "123",
                name: {data: "incorrect_field"},
                accounts: {
                    FB: 123,
                    OK: "a_strin",
                    OTHER: "restricted_key"
                }
            });
        }
    }
};
