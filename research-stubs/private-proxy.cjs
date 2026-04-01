const handler = {
  get(_target, prop) {
    if (prop === '__esModule') return true
    if (prop === 'default') return proxy
    if (prop === 'then') return undefined
    if (prop === Symbol.toPrimitive) return () => 0
    if (prop === Symbol.iterator) return function* iterator() {}
    return proxy
  },
  apply() {
    return undefined
  },
  construct() {
    return {}
  },
}

const proxy = new Proxy(function privateResearchStub() {}, handler)

module.exports = proxy
module.exports.default = proxy
module.exports.__esModule = true
