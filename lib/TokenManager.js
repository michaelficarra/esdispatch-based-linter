/*
 * Store all of the tokens from the AST as a linked list for
 * efficient sequential access, and index in a hash table based on
 * the range's start for efficient random access.
 */
function TokenManager(tokens) {
  var currentTokens = this.currentTokens = [];
  for (var i = 0, l = tokens.length; i < l; ++i) {
    var token = tokens[i],
      node = {
        token: token,
        previous: node,
        next: null
      };

    if (i > 0) {
      node.previous.next = node;
    }

    currentTokens[token.range[0]] = node;
  }
}

TokenManager.prototype = {
  constructor: TokenManager,

  /**
   * Gets a number of tokens that precede a given node's tokens in the token stream.
   * @param {ASTNode} node The AST node.
   * @param {int} [beforeCount=0] The number of tokens before the node to retrieve.
   * @returns {[Token]} Array of objects representing tokens.
   */
  getTokensBefore: function(node, beforeCount) {
    var beforeTokens = [],
      cursor = this.currentTokens[node.range[0]];

    cursor = cursor.previous;
    while (beforeTokens.length < beforeCount && cursor) {
      beforeTokens.unshift(cursor.token);
      cursor = cursor.previous;
    }

    return beforeTokens;
  },

  /**
   * Gets the token that precedes a given node's tokens in the token stream.
   * @param {ASTNode} node The AST node.
   * @param {int} [skip=0] A number of tokens to skip before the given node.
   * @returns {Token} An object representing the token.
   */
  getTokenBefore: function(node, skip) {
    var cursor = this.currentTokens[node.range[0]];

    cursor = cursor.previous;
    while (skip > 0 && cursor) {
      cursor = cursor.previous;
      --skip;
    }

    return cursor && cursor.token;
  },

  /**
   * Gets a number of tokens that precede a given node's tokens in the token stream.
   * @param {ASTNode} node The AST node.
   * @param {int} [afterCount=0] The number of tokens after the node to retrieve.
   * @returns {[Token]} Array of objects representing tokens.
   */
  getTokensAfter: function(node, afterCount) {
    var afterTokens = [],
      cursor = node.range[1],
      currentTokens = this.currentTokens;

    while (!currentTokens[cursor] && cursor < currentTokens.length) {
      ++cursor;
    }

    cursor = currentTokens[cursor];
    while (afterTokens.length < afterCount && cursor) {
      afterTokens.push(cursor.token);
      cursor = cursor.next;
    }

    return afterTokens;
  },

  /**
   * Gets the token that follows a given node's tokens in the token stream.
   * @param {ASTNode} node The AST node.
   * @param {int} [skip=0] A number of tokens to skip after the given node.
   * @returns {Token} An object representing the token.
   */
  getTokenAfter: function(node, skip) {
    var cursor = node.range[1],
      currentTokens = this.currentTokens;

    while (!currentTokens[cursor] && cursor < currentTokens.length) {
      ++cursor;
    }

    cursor = currentTokens[cursor];
    while (skip > 0 && cursor) {
      cursor = cursor.next;
      --skip;
    }

    return cursor && cursor.token;
  },

  /**
   * Gets all tokens that are related to the given node.
   * @param {ASTNode} node The AST node.
   * @param {int} [beforeCount=0] The number of tokens before the node to retrieve.
   * @param {int} [afterCount=0] The number of tokens after the node to retrieve.
   * @returns {[Token]} Array of objects representing tokens.
   */
  getTokens: function(node, beforeCount, afterCount) {
    var beforeTokens = this.getTokensBefore(node, beforeCount),
      afterTokens = this.getTokensAfter(node, afterCount),
      tokens = [],
      cursor = this.currentTokens[node.range[0]],
      endRange = node.range[1];

    while (cursor && cursor.token.range[1] <= endRange) {
      tokens.push(cursor.token);
      cursor = cursor.next;
    }

    return beforeTokens.concat(tokens, afterTokens);
  },

  /**
   * Gets the first `count` tokens of the given node's token stream.
   * @param {ASTNode} node The AST node.
   * @param {int} [count=0] The number of tokens of the node to retrieve.
   * @returns {[Token]} Array of objects representing tokens.
   */
  getFirstTokens: function(node, count) {
    var cursor = this.currentTokens[node.range[0]],
      endRange = node.range[1],
      tokens = [];

    while (tokens.length < count && cursor && cursor.token.range[1] <= endRange) {
      tokens.push(cursor.token);
      cursor = cursor.next;
    }

    return tokens;
  },

  /**
   * Gets the first token of the given node's token stream.
   * @param {ASTNode} node The AST node.
   * @param {int} [skip=0] A number of tokens to skip.
   * @returns {Token} An object representing the token.
   */
  getFirstToken: function(node, skip) {
    var cursor = this.currentTokens[node.range[0]],
      endRange = node.range[1];

    while (skip > 0 && cursor && cursor.token.range[1] <= endRange) {
      cursor = cursor.next;
      --skip;
    }

    return cursor && cursor.token;
  },

  /**
   * Gets the last `count` tokens of the given node.
   * @param {ASTNode} node The AST node.
   * @param {int} [count=0] The number of tokens of the node to retrieve.
   * @returns {[Token]} Array of objects representing tokens.
   */
  getLastTokens: function(node, count) {
    var beginRange = node.range[0],
      cursor = node.range[1] - 1,
      tokens = [],
      currentTokens = this.currentTokens;

    while (!currentTokens[cursor] && cursor >= 0) {
      --cursor;
    }

    cursor = currentTokens[cursor];
    while (tokens.length < count && cursor && beginRange <= cursor.token.range[0]) {
      tokens.unshift(cursor.token);
      cursor = cursor.previous;
    }

    return tokens;
  },

  /**
   * Gets the last token of the given node's token stream.
   * @param {ASTNode} node The AST node.
   * @param {int} [skip=0] A number of tokens to skip.
   * @returns {Token} An object representing the token.
   */
  getLastToken: function(node, skip) {
    var beginRange = node.range[0],
      cursor = node.range[1] - 1,
      currentTokens = this.currentTokens;

    while (!currentTokens[cursor] && cursor >= 0) {
      --cursor;
    }

    cursor = currentTokens[cursor];
    while (skip > 0 && cursor && beginRange <= cursor.token.range[0]) {
      cursor = cursor.previous;
      --skip;
    }

    return cursor && cursor.token;
  },

}

module.exports = TokenManager.TokenManager = TokenManager;
