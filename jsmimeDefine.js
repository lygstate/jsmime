'use strict'
const path = require('path')
define(function (require, exports, module) {
  const mainURI = path.join(module.uri, '../jsmimeMain')
  return require(mainURI)
})
