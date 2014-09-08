var esprima = require('esprima');
var Dispatcher = require('esdispatch');

var RULES = {
  camelcase: require('./rules/camelcase'),
  'no-void': require('./rules/no-void.js'),
  'no-undefined': require('./rules/no-undefined.js'),
  yoda: require('./rules/yoda'),
}
var RULE_OPTIONS = {};

function escapeRegExp(s) {
    return s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function template(message, replacements) {
    Object.keys(replacements).forEach(function (key) {
        var rx = new RegExp("{{" + escapeRegExp(key) + "}}", "g");
        message = message.replace(rx, replacements[key]);
    });
    return message;
}

function lint(js, cb) {
  var dispatcher = new Dispatcher;
  var messages = [];
  function report(node, location, message, replacements) {
    if (typeof location === "string") {
        replacements = message;
        message = location;
        location = node.loc.start;
    }

    messages.push({
        //ruleId: ruleId,
        //severity: severity,
        node: node,
        message: template(message, replacements || {}),
        line: location.line,
        column: location.column,
        //source: api.getSource(node)
    });
  };

  for (var ruleId in RULES) {
    if (!{}.hasOwnProperty.call(RULES, ruleId)) continue;
    var rule = RULES[ruleId]({
      report: report,
      options: {}.hasOwnProperty.call(RULE_OPTIONS, ruleId) ? RULE_OPTIONS[ruleId] : []
    });
    for (var query in rule) {
      if (!{}.hasOwnProperty.call(rule, query)) continue;
      dispatcher.on(query, rule[query]);
    }
  }

  var ast = esprima.parse(js, {
    loc: true,
    range: true,
    raw: true,
    tokens: true,
    comment: true,
    attachComment: true
  });

  dispatcher.observe(ast, function() {
    cb(messages);
  });
}

module.exports = {
  lint: lint
};
