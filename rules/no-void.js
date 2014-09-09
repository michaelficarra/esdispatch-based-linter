"use strict";

// disallow use of void operator
module.exports = function(context) {

  return {
    "UnaryExpression[operator=void]": function(node) {
        context.report(node, "Expected 'undefined' and instead saw 'void'.");
    }
  };

};
