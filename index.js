var EventEmitter = require('events').EventEmitter;

var escope = require('escope');
var esprima = require('esprima');
var Dispatcher = require('esdispatch');
var TokenManager = require('./lib/TokenManager');

var RULES = {
  camelcase: require('./rules/camelcase'),
  'no-void': require('./rules/no-void.js'),
  'no-undefined': require('./rules/no-undefined'),
  quotes: require('./rules/quotes'),
  'space-infix-ops': require('./rules/space-infix-ops'),
  yoda: require('./rules/yoda'),
}
var RULE_OPTIONS = {
  quotes: ['single', 'avoid-escape']
};

var SEVERITIES = { IGNORE: 0, WARN: 1, ERROR: 2 };

function escapeRegExp(s) {
    return s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function template(message, replacements) {
    Object.keys(replacements).forEach(function (key) {
        var rx = new RegExp('{{' + escapeRegExp(key) + '}}', 'g');
        message = message.replace(rx, replacements[key]);
    });
    return message;
}

function reporterGeneratorGenerator(emitter) {
  return function(ruleId) {
    return function report(node, location, message, replacements) {
      if (typeof location === 'string') {
          replacements = message;
          message = location;
          location = node.loc.start;
      }

      emitter.emit('error', {
          ruleId: ruleId,
          severity: SEVERITIES.ERROR,
          node: node,
          message: template(message, replacements || {}),
          line: location.line,
          column: location.column,
          //source: api.getSource(node)
      });
    };
  }
}

function getScopeGenerator(scopes) {
  var scopeLookupTable = {};
  for (var i = 0, l = scopes.length; i < l; ++i) {
    var scope = scopes[i];
    if (!scope.functionExpressionScope) {
      scopeLookupTable[scope.block.range[0]] = scope;
    }
  }
  return function getScope(node) {
    var index = node.range[0];
    if (index != null && {}.hasOwnProperty.call(scopeLookupTable, index)) {
      return scopeLookupTable[index];
    }
  };
}

function Linter(){}
Linter.prototype = Object.create(EventEmitter.prototype);
Linter.prototype.lint = function lint(js) {
  // replace shebang with single-line comment
  js = js.replace(/^#!([^\r\n]+[\r\n]+)/, '//$1');

  try {
    var ast = esprima.parse(js, {
      loc: true,
      range: true,
      raw: true,
      tokens: true,
      comment: true,
      attachComment: true
    });
  } catch(e) {
    this.emit('error', {
      ruleId: 'syntax-error',
      severity: SEVERITIES.ERROR,
      // messages come as 'Line X: Unexpected token foo', so strip off leading part
      message: e.message.substring(e.message.indexOf(':') + 1).trim(),
      line: e.lineNumber,
      column: e.column,
      source: js.split(/(\r?\n)/)[(e.lineNumber - 1) * 2]
    });
    return;
  }

  var scopes = escope.analyze(ast).scopes;

  var dispatcher = new Dispatcher;
  var reporterGenerator = reporterGeneratorGenerator(this);
  var tokenManager = new TokenManager(ast.tokens);

  var api = Object.create(tokenManager);
  api.getScope = getScopeGenerator(scopes);

  for (var ruleId in RULES) {
    if (!{}.hasOwnProperty.call(RULES, ruleId)) continue;
    var context = Object.create(api);
    context.options = {}.hasOwnProperty.call(RULE_OPTIONS, ruleId) ? RULE_OPTIONS[ruleId] : [];
    context.report = reporterGenerator(ruleId);
    var rule = RULES[ruleId](context);
    for (var query in rule) {
      if (!{}.hasOwnProperty.call(rule, query)) continue;
      dispatcher.on(query, rule[query]);
    }
  }

  dispatcher.observe(ast, function() {
    this.emit('done');
  }.bind(this));
}

module.exports = Linter.Linter = Linter;
