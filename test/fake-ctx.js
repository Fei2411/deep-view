// The smallest cordis context Deep UI's host half touches.
export function fakeContext() {
  const registeredTools = new Map()
  const listeners = new Map()
  const agentsRegistry = { map: new Map(), get(id) { return this.map.get(id) }, roots() { return [...this.map.values()].filter(a => a.root !== false) } }
  const ctx = {
    registeredTools,
    listeners,
    agentsRegistry,
    tools: { register: definition => (registeredTools.set(definition.name, definition), () => registeredTools.delete(definition.name)) },
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
