var util = require('util');

if (!Error.captureStackTrace) {
    Error.captureStackTrace = function() {
        return (new Error()).stack;
    };
}

function SchemaError() {
  Error.call(this);
  this.name = "SchemaError";
  this.message = util.format.apply(this, arguments);
  Error.captureStackTrace(this, arguments.callee);
}

util.inherits(SchemaError, Error);

module.exports = SchemaError;
