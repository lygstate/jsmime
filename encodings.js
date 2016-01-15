'use strict'


if (typeof TextDecoder === 'undefined' || typeof TextEncoder === 'undefined') {
  // TODO: GB18030 decode is invalid in text-encoding
  module.exports = require('text-encoding')
} else {
  module.exports = {
    TextDecoder: TextDecoder,
    TextEncoder: TextEncoder
  }
}
