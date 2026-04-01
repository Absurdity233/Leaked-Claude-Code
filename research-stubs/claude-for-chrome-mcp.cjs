const proxy = require('./private-proxy.cjs')

module.exports = Object.assign(proxy, {
  __esModule: true,
  default: proxy,
  BROWSER_TOOLS: [],
  createClaudeForChromeMcpServer() {
    return proxy
  },
})
