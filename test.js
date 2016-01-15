'use strict'
require('babel-register')
const requirejs = require('requirejs')

global.atob = require('atob')
global.btoa = require('btoa')
global.fs = require('fs')

let savedConfig = {}
const define = function (id, depends, func) {
  // Check if there is a dependency array or if the function is the first arg
  if (typeof func === 'undefined') {
    if (typeof depends === 'undefined') {
      func = id
      depends = []
      id = null
    } else {
      func = depends
      depends = id
      id = null
    }
  }

  // Load the modules in depends
  var d = []
  for (var i = 0; i < depends.length; i++) {
    var m
    try { // Try tp load from a requirejs path
      m = require(requirejs.toUrl(depends[i]))
    } catch (e) { // Fallback to default require
      m = require(depends[i])
    }
    d.push(m)
  }

  // Find the uri of he module that called define
  let uri = new Error().stack.split('\n')[2].match(/\((.*):\d*:\d*/)[1]
  id = id || uri
  let module = {
    id: id,
    uri: uri,
    config: savedConfig,
    exports: {},
  }

  require.cache[id] = module

  if (d.length === 0) {
    d.push(requirejs, module.exports, module)
  }

  const e = func.apply(this, d)
  if (e !== undefined) {
    module.exports = e
  }
}

define.config = function (c) {
  c.nodeRequire = require
  savedConfig = c
  requirejs.config(c)
}

define.config({
  baseUrl: __dirname,
  paths: {
    es6: 'node_modules/requirejs-babel/es6',
    babel: 'node_modules/requirejs-babel/babel-5.8.22.min',
    jsmime: 'jsmimeDefine'
  }
})
global.define = define
