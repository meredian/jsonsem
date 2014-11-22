var DSL = require('../lib/dsl');

module.exports = {
    name: "Instantiation",
    cases: {
        "With small schema": function() {
            new DSL().schema(function() {
                this.key('user_id', {type: 'uint'});
                this.key('name', {type: 'string'});
                this.key('cretendtial', {type: 'object'}, function() {
                    this.eachKey(this.inSet(['MM', 'FB', 'VK', 'OK']), {type: 'uint'});
                });
            });

        }
    }
};
