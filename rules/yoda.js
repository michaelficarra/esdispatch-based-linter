"use strict";

// require or disallow yoda comparisons
module.exports = function (context) {

  // Default to "never" (!always) if no option
  var always = (context.options[0] === "always");

  // Determines whether an operator is a comparison operator.
  function isComparisonOperator(operator) {
    return (/^(==|===|!=|!==|<|>|<=|>=)$/).test(operator);
  }

  return {
    BinaryExpression: function (node) {
      if (always) {
        // Comparisons must always be yoda-style: if ("blue" === color)
        if (node.right.type === "Literal" && isComparisonOperator(node.operator)) {
          context.report(node, "Expected literal to be on the left side of " + node.operator + ".");
        }
      } else if (node.left.type === "Literal" && isComparisonOperator(node.operator)) {
        // Comparisons must never be yoda-style (default)
        context.report(node, "Expected literal to be on the right side of " + node.operator + ".");
      }
    }
  };

};
