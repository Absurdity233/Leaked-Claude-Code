const proxy = require('./private-proxy.cjs')

module.exports = Object.assign(proxy, {
  __esModule: true,
  default: proxy,
  DEFAULT_GRANT_FLAGS: {},
})
