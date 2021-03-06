/* eslint-disable no-redeclare */
var assert = require('assert')
var dash = require('dash-ast')
var Symbol = require('es6-symbol')
var getAssignedIdentifiers = require('get-assigned-identifiers')
var isFunction = require('estree-is-function')
var Binding = require('./binding')
var Scope = require('./scope')

var kScope = Symbol('scope')

exports.createScope = createScope
exports.visitScope = visitScope
exports.visitBinding = visitBinding
exports.crawl = crawl
exports.analyze = crawl // old name
exports.clear = clear
exports.deleteScope = deleteScope
exports.nearestScope = getNearestScope
exports.scope = getScope
exports.getBinding = getBinding

function set (object, property, value) {
  Object.defineProperty(object, property, {
    value: value,
    enumerable: false,
    configurable: true,
    writable: true
  })
}

// create a new scope at a node.
function createScope (node, bindings) {
  assert.ok(typeof node === 'object' && node && typeof node.type === 'string', 'scope-analyzer: createScope: node must be an ast node')
  if (!node[kScope]) {
    var parent = getParentScope(node)
    set(node, kScope, new Scope(parent))
  }
  if (bindings) {
    for (var i = 0; i < bindings.length; i++) {
      node[kScope].define(new Binding(bindings[i]))
    }
  }
  return node[kScope]
}

// Separate scope and binding registration steps, for post-order tree walkers.
// Those will typically walk the scope-defining node _after_ the bindings that belong to that scope,
// so they need to do it in two steps in order to define scopes first.
function visitScope (node) {
  assert.ok(typeof node === 'object' && node && typeof node.type === 'string', 'scope-analyzer: visitScope: node must be an ast node')
  registerScopeBindings(node)
}
function visitBinding (node) {
  assert.ok(typeof node === 'object' && node && typeof node.type === 'string', 'scope-analyzer: visitBinding: node must be an ast node')
  if (isVariable(node)) {
    registerReference(node)
  }
}

function crawl (ast) {
  assert.ok(typeof ast === 'object' && ast && typeof ast.type === 'string', 'scope-analyzer: crawl: ast must be an ast node')
  dash(ast, function (node, parent) {
    set(node, 'parent', parent)
    visitScope(node)
  })
  dash(ast, visitBinding)

  return ast
}

function clear (ast) {
  assert.ok(typeof ast === 'object' && ast && typeof ast.type === 'string', 'scope-analyzer: clear: ast must be an ast node')
  dash(ast, deleteScope)
}

function deleteScope (node) {
  if (node) {
    delete node[kScope]
  }
}

function getScope (node) {
  if (node && node[kScope]) {
    return node[kScope]
  }
  return null
}

function getBinding (identifier) {
  assert.strictEqual(typeof identifier, 'object', 'scope-analyzer: getBinding: identifier must be a node')
  assert.strictEqual(identifier.type, 'Identifier', 'scope-analyzer: getBinding: identifier must be an Identifier node')

  var scopeNode = getDeclaredScope(identifier)
  if (!scopeNode) return null
  var scope = getScope(scopeNode)
  if (!scope) return null
  return scope.getBinding(identifier.name) || scope.undeclaredBindings.get(identifier.name)
}

function registerScopeBindings (node) {
  if (node.type === 'Program') {
    createScope(node)
  }
  if (node.type === 'VariableDeclaration') {
    var scopeNode = getNearestScope(node, node.kind !== 'var')
    var scope = createScope(scopeNode)
    node.declarations.forEach(function (decl) {
      getAssignedIdentifiers(decl.id).forEach(function (id) {
        scope.define(new Binding(id.name, id))
      })
    })
  }
  if (node.type === 'ClassDeclaration') {
    var scopeNode = getNearestScope(node)
    var scope = createScope(scopeNode)
    if (node.id && node.id.type === 'Identifier') {
      scope.define(new Binding(node.id.name, node.id))
    }
  }
  if (node.type === 'FunctionDeclaration') {
    var scopeNode = getNearestScope(node, false)
    var scope = createScope(scopeNode)
    if (node.id && node.id.type === 'Identifier') {
      scope.define(new Binding(node.id.name, node.id))
    }
  }
  if (isFunction(node)) {
    var scope = createScope(node)
    node.params.forEach(function (param) {
      getAssignedIdentifiers(param).forEach(function (id) {
        scope.define(new Binding(id.name, id))
      })
    })
  }
  if (node.type === 'FunctionExpression' || node.type === 'ClassExpression') {
    var scope = createScope(node)
    if (node.id && node.id.type === 'Identifier') {
      scope.define(new Binding(node.id.name, node.id))
    }
  }
  if (node.type === 'ImportDeclaration') {
    var scopeNode = getNearestScope(node, false)
    var scope = createScope(scopeNode)
    getAssignedIdentifiers(node).forEach(function (id) {
      scope.define(new Binding(id.name, id))
    })
  }
  if (node.type === 'CatchClause') {
    var scope = createScope(node)
    if (node.param) {
      getAssignedIdentifiers(node.param).forEach(function (id) {
        scope.define(new Binding(id.name, id))
      })
    }
  }
}

function getParentScope (node) {
  var parent = node
  while (parent.parent) {
    parent = parent.parent
    if (getScope(parent)) return getScope(parent)
  }
}

// Get the scope that a declaration will be declared in
function getNearestScope (node, blockScope) {
  var parent = node
  while (parent.parent) {
    parent = parent.parent
    if (isFunction(parent)) {
      break
    }
    if (blockScope && parent.type === 'BlockStatement') {
      break
    }
    if (parent.type === 'Program') {
      break
    }
  }
  return parent
}

// Get the scope that this identifier has been declared in
function getDeclaredScope (id) {
  var parent = id
  // Jump over one parent if this is a function's name--the variables
  // and parameters _inside_ the function are attached to the FunctionDeclaration
  // so if a variable inside the function has the same name as the function,
  // they will conflict.
  // Here we jump out of the FunctionDeclaration so we can start by looking at the
  // surrounding scope
  if (id.parent.type === 'FunctionDeclaration' && id.parent.id === id) {
    parent = id.parent
  }
  while (parent.parent) {
    parent = parent.parent
    if (parent[kScope] && parent[kScope].has(id.name)) {
      break
    }
  }
  return parent
}

function registerReference (node) {
  var scopeNode = getDeclaredScope(node)
  var scope = getScope(scopeNode)
  if (scope && scope.has(node.name)) {
    scope.add(node.name, node)
  }
  if (scope && !scope.has(node.name)) {
    scope.addUndeclared(node.name, node)
  }
}

function isObjectKey (node) {
  return node.parent.type === 'Property' &&
    node.parent.key === node &&
    // a shorthand property may have the ===-same node as both the key and the value.
    // we should detect the value part.
    node.parent.value !== node
}
function isMethodDefinition (node) {
  return node.parent.type === 'MethodDefinition' && node.parent.key === node
}
function isImportName (node) {
  return node.parent.type === 'ImportSpecifier' && node.parent.imported === node
}

function isVariable (node) {
  return node.type === 'Identifier' &&
    !isObjectKey(node) &&
    !isMethodDefinition(node) &&
    (node.parent.type !== 'MemberExpression' || node.parent.object === node ||
      (node.parent.property === node && node.parent.computed)) &&
    !isImportName(node)
}
