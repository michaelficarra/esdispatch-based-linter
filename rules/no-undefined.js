"use strict";

// flag references to the undefined variable
module.exports = function(context) {

  return {
    "Identifier[name=undefined]": function(node, ancestors) {
      var parent = ancestors[0];
      if (!parent || parent.type !== "MemberExpression" || node !== parent.property || parent.computed) {
        context.report(node, "Unexpected use of undefined.");
      }
    }
  };

};
