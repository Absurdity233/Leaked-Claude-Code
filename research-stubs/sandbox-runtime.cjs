class SandboxManager {}

class SandboxViolationStore {
  constructor() {
    this.events = []
  }

  add(event) {
    this.events.push(event)
  }

  clear() {
    this.events = []
  }
}

const SandboxRuntimeConfigSchema = {
  parse(value) {
    return value
  },
  safeParse(value) {
    return { success: true, data: value }
  },
}

module.exports = {
  __esModule: true,
  SandboxManager,
  SandboxRuntimeConfigSchema,
  SandboxViolationStore,
}
