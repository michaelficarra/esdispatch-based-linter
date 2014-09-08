/**
 * @fileoverview Rule to flag references to the undefined variable.
 * @author Michael Ficarra
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    return {

        "Identifier[name=undefined]": function(err, node, ancestors) {
            var parent = ancestors[0];
            if (!parent || parent.type !== "MemberExpression" || node !== parent.property || parent.computed) {
                context.report(node, "Unexpected use of undefined.");
            }
        }
    };

};
