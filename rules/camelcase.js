/**
 * @fileoverview Rule to flag non-camelcased identifiers
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    "use strict";

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    /**
     * Checks if a string contains an underscore and isn't all upper-case
     * @param {String} name The string to check.
     * @returns {boolean} if the string is underscored
     * @private
     */
    function isUnderscored(name) {

        // if there's an underscore, it might be A_CONSTANT, which is okay
        return name.indexOf("_") > -1 && name !== name.toUpperCase();
    }

    /**
     * Reports an AST node as a rule violation.
     * @param {ASTNode} node The node to report.
     * @returns {void}
     * @private
     */
    function report(node) {
        context.report(node, "Identifier '{{name}}' is not in camel case.", { name: node.name });
    }

    return {

        "Identifier": function(err, node, ancestors) {
            var parent = ancestors[0];

            // Leading and trailing underscores are commonly used to flag private/protected identifiers, strip them
            var name = node.name.replace(/^_+|_+$/g, "");

            // MemberExpressions get special rules
            if (parent.type === "MemberExpression") {
                var effectiveParent = ancestors[1];

                // Always report underscored object names
                if (parent.object.type === "Identifier" &&
                        parent.object.name === node.name &&
                        isUnderscored(name)) {
                    report(node);

                // Report AssignmentExpressions only if they are the left side of the assignment
                } else if (effectiveParent.type === "AssignmentExpression" &&
                        isUnderscored(name) &&
                        (effectiveParent.right.type !== "MemberExpression" ||
                        effectiveParent.left.type === "MemberExpression" &&
                        effectiveParent.left.property.name === node.name)) {
                    report(node);
                }

            // Report anything that is underscored that isn't a CallExpression
            } else if (isUnderscored(name) && parent.type !== "CallExpression") {
                report(node);
            }
        }
    };

};
