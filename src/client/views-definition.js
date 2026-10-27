// The conversation Definition behind the turn tail: it folds each turn's
// successful show_view calls — callId plus the raw arguments — into the
// `deep-view-views` turn-data value the tail renders. Refused or failed calls
// contribute nothing, so replay reproduces exactly the views that landed.
export const viewsDefinition = {
  kind: 'deep-view-views',
  match(event) {
    if (event?.type === 'turn/start') return { id: String(event.data?.turn), role: 'start' }
    if (event?.type === 'tool/call' && event.data?.name === 'show_view') return { id: String(event.data?.turn), role: 'update' }
    if (event?.type === 'tool/result' && event.data?.turn !== undefined) return { id: String(event.data.turn), role: 'update' }
    return null
  },
  start: (context, match) => ({ turn: match.event.data.turn, calls: new Map() }),
  update: (context, match) => {
    const { state } = context
    const event = match.event
    if (event.type === 'tool/call') {
      let args = null
      try { args = JSON.parse(event.data.arguments) } catch { args = null }
      if (args === null || typeof args !== 'object' || Array.isArray(args)) return state
      const calls = new Map(state.calls)
      calls.set(String(event.data.callId), { callId: String(event.data.callId), args, ok: null })
      return { ...state, calls }
    }
    if (event.type === 'tool/result') {
      const callId = String(event.data?.message?.source?.callId ?? '')
      if (!state.calls.has(callId)) return state
      const calls = new Map(state.calls)
      // Only a result this plugin answered carries the presentationMeta marker;
      // a same-named call another plugin's scoped tool ran stays undrawn.
      const mine = event.data?.meta?.owner === 'deep-view'
      calls.set(callId, { ...calls.get(callId), ok: mine && event.data.message?.isError !== true })
      return { ...state, calls }
    }
    return state
  },
  buildLocationData: (context, scope, previous) => {
    if (scope !== 'turn' || context.state === undefined) return null
    const views = [...context.state.calls.values()].filter(call => call.ok === true)
    if (previous?.kind === 'turn' && previous.turn === context.state.turn && previous.key === 'deep-view-views'
      && previous.value.views.length === views.length && previous.value.views.every((call, index) => call === views[index])) {
      return previous
    }
    return {
      kind: 'turn',
      turn: context.state.turn,
      key: 'deep-view-views',
      value: { views },
    }
  },
}
