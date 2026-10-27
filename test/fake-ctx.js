// The smallest cordis context Deep View's host half touches.
export function fakeContext() {
  const registeredTools = new Map()
  const listeners = new Map()
  const warnings = []
  const agentsRegistry = { map: new Map(), get(id) { return this.map.get(id) }, roots() { return [...this.map.values()].filter(a => a.root !== false) } }
  const ctx = {
    registeredTools,
    listeners,
    warnings,
    agentsRegistry,
    logger: { warn: (...args) => warnings.push(args.join(' ')) },
    tools: { register: definition => {
      if (registeredTools.has(definition.name)) throw new Error(`tool "${definition.name}" is already registered`)
      registeredTools.set(definition.name, definition)
      return () => registeredTools.delete(definition.name)
    } },
    on: (event, fn) => listeners.set(event, [...(listeners.get(event) ?? []), fn]),
    effect: (fn) => { fn() },
    get: name => (name === 'agents' ? agentsRegistry : undefined),
    connection: { fetch: { register: () => async () => {} } },
    sessionController: {},
    sessions: {},
    dispose: async () => {},
  }
  return ctx
}
