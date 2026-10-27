import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement', 'SVGElement', 'Element', 'Node', 'MutationObserver', 'getComputedStyle', 'CustomEvent', 'Event', 'KeyboardEvent', 'MouseEvent']) {
  if (dom.window[key] === undefined) continue
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true })
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const { createElement: h, act } = await import('react')
const { createRoot } = await import('react-dom/client')
const { WidgetCard, ViewUi } = await import('../src/react/index.js')
const { ViewsTail } = await import('../src/client/tail.js')
const { ViewReplyNode, viewReplyRule } = await import('../src/client/reply-node.js')
const { viewsDefinition } = await import('../src/client/views-definition.js')

const t = (key, data) => (data?.n !== undefined ? `${key} ${data.n}` : key)
const ui = { t, Markdown: ({ text }) => h('span', { className: 'md' }, String(text ?? '')) }

const METER = { type: 'metric', label: 'Progress', value: '70%' }
const CHOICES = { type: 'options', id: 'pick', options: [{ label: 'A' }, { label: 'B' }] }
const REPLY = (callId, selected = ['A']) => JSON.stringify({
  kind: 'answer_to_pending_view', tool: 'show_view', callId,
  views: [{ id: 'v1', title: 'Pick', view: CHOICES }],
  answers: [{ id: 'v1', action: 'pick', values: { selected } }],
})

async function render(node) {
  const box = document.createElement('div')
  document.body.appendChild(box)
  const root = createRoot(box)
  await act(async () => { root.render(h(ViewUi.Provider, { value: ui }, node)) })
  return { box, root, unmount: () => act(async () => { root.unmount(); box.remove() }) }
}

// A TurnLocation carrying the given folded views, the way the Definition publishes them.
const makeTurn = (views) => {
  const data = { views }
  return {
    data: {
      get: key => (key === 'deep-ui-views' ? data : undefined),
      source: () => ({ getSnapshot: () => data, subscribe: () => () => {} }),
    },
  }
}

// A ConversationSnapshot with `count` chat nodes, plus an optional reply text node.
const convOf = (count = 0, replyText) => ({
  views: new Map([['chat', {
    order: replyText === undefined ? [...Array(count).keys()].map(index => `n${index}`) : [...Array(count).keys()].map(index => `n${index}`).concat('reply'),
    nodes: new Map(replyText === undefined ? [] : [['reply', { data: { text: replyText } }]]),
  }]]),
})
const useConversationOf = snapshot => selector => selector(snapshot)

const recordCalls = (record) => {
  const calls = []
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options?.body ?? '{}')
    calls.push(body)
    if (body.op === 'pending') return new Response(JSON.stringify({ ok: true, value: record }))
    return new Response(JSON.stringify({ ok: true, value: true }))
  }
  return calls
}

test('display-only call renders the card from its arguments, without asking for a record', async () => {
  const calls = recordCalls(null)
  const turn = makeTurn([{ callId: 'c1', args: { title: 'Stats', view: METER } }])
  const { box, unmount } = await render(h(ViewsTail, { turn, sessionId: 's1', useConversation: useConversationOf(convOf(1)) }))
  assert.ok(box.querySelector('.dui-view-bare'), 'bare card')
  assert.equal(box.querySelector('.dui-widget-metric-label')?.textContent, 'Progress')
  assert.equal(calls.filter(body => body.op === 'pending').length, 0, 'display views never query pending')
  await unmount()
})

test('interactive call renders the live card while the record names it', async () => {
  recordCalls({ id: 'v1', callId: 'c2', title: 'Pick', view: CHOICES, askedAt: 1 })
  const turn = makeTurn([{ callId: 'c2', args: { title: 'Pick', view: CHOICES } }])
  const { box, unmount } = await render(h(ViewsTail, { turn, sessionId: 's1', useConversation: useConversationOf(convOf(2)) }))
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  assert.ok(box.querySelector('.dui-q'), 'interactive card')
  assert.ok(box.querySelector('.dui-q-opt'), 'option rows')
  await unmount()
})

test('interactive call without a matching record renders nothing', async () => {
  recordCalls({ id: 'v1', callId: 'other', title: 'Pick', view: CHOICES, askedAt: 1 })
  const turn = makeTurn([{ callId: 'c3', args: { view: CHOICES } }])
  const { box, unmount } = await render(h(ViewsTail, { turn, sessionId: 's1', useConversation: useConversationOf(convOf(2)) }))
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  assert.equal(box.querySelector('.dui-q'), null)
  await unmount()
})

test('refused call (invalid blueprint) renders nothing', async () => {
  recordCalls(null)
  const turn = makeTurn([{ callId: 'c4', args: { view: { type: 'nope' } } }])
  const { box, unmount } = await render(h(ViewsTail, { turn, sessionId: 's1', useConversation: useConversationOf(convOf(1)) }))
  assert.equal(box.querySelector('.dui-view'), null)
  await unmount()
})

test('submitting an options card posts a reply and removes the card', async () => {
  const calls = recordCalls({ id: 'v1', callId: 'c5', view: CHOICES, askedAt: 1 })
  const turn = makeTurn([{ callId: 'c5', args: { view: CHOICES } }])
  const { box, unmount } = await render(h(ViewsTail, { turn, sessionId: 's1', useConversation: useConversationOf(convOf(2)) }))
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  const option = box.querySelector('.dui-q-opt')
  assert.ok(option, 'option row present')
  // A single-select options card answers on the pick itself, no submit step.
  await act(async () => { option.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })) })
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  const reply = calls.find(body => body.op === 'reply')
  assert.ok(reply, 'reply op posted')
  assert.equal(reply.viewId, 'v1')
  assert.equal(reply.action, 'pick')
  assert.deepEqual(reply.values.selected, ['A'])
  await unmount()
})

test('an answered view renders the settled card from the reply in the chat, no pending fetch', async () => {
  const calls = recordCalls(null)
  const replyText = REPLY('c6', ['B'])
  const turn = makeTurn([{ callId: 'c6', args: { title: 'Pick', view: CHOICES } }])
  const { box, unmount } = await render(h(ViewsTail, { turn, sessionId: 's1', useConversation: useConversationOf(convOf(3, replyText)) }))
  assert.ok(box.querySelector('.dui-q-settled'), 'settled card')
  assert.equal(box.querySelector('.dui-q-submit'), null, 'no live controls')
  assert.equal(calls.filter(body => body.op === 'pending').length, 0, 'answered views never query pending')
  await unmount()
})

test('the reply bubble shows a compact answer summary, not the JSON', async () => {
  const replyText = REPLY('c7', ['B'])
  const matched = viewReplyRule.match(replyText, 0)
  assert.ok(matched, 'rule claims the reply text')
  const { box, unmount } = await render(h(ViewReplyNode, { node: { data: { text: replyText } } }))
  const bubble = box.querySelector('.dui-ububble')
  assert.ok(bubble, 'bubble present')
  assert.equal(bubble.textContent, 'B')
  await unmount()
})

test('the Definition folds only successful show_view calls into turn data', () => {
  const events = [
    { type: 'turn/start', seq: 1, data: { turn: 1 } },
    { type: 'tool/call', seq: 2, data: { turn: 1, step: 1, callId: 'c1', name: 'show_view', arguments: JSON.stringify({ title: 'Stats', view: METER }) } },
    { type: 'tool/call', seq: 3, data: { turn: 1, step: 1, callId: 'c2', name: 'pwsh', arguments: '{"cmd":"x"}' } },
    { type: 'tool/result', seq: 4, data: { turn: 1, step: 1, message: { source: { callId: 'c1' } } } },
    { type: 'tool/call', seq: 5, data: { turn: 1, step: 1, callId: 'c3', name: 'show_view', arguments: JSON.stringify({ view: CHOICES }) } },
    { type: 'tool/result', seq: 6, data: { turn: 1, step: 1, message: { source: { callId: 'c3' }, isError: true } } },
  ]
  let context = { state: undefined }
  let state
  for (const event of events) {
    const matched = viewsDefinition.match(event)
    if (matched === null) { assert.equal(event.data.name, 'pwsh'); continue }
    if (matched.role === 'start') state = viewsDefinition.start(context, { event, role: 'start' })
    else state = viewsDefinition.update({ ...context, state }, { event, role: 'update' })
  }
  const data = viewsDefinition.buildLocationData({ ...context, state }, 'turn', null)
  assert.equal(data.key, 'deep-ui-views')
  assert.equal(data.value.views.length, 1, 'one successful call')
  assert.equal(data.value.views[0].callId, 'c1')
  assert.deepEqual(data.value.views[0].args, { title: 'Stats', view: METER })
})

test('a WidgetCard uses the dui- class names', async () => {
  const { box, unmount } = await render(h(WidgetCard, { title: 'T', view: METER, settled: true }))
  assert.ok(box.querySelector('.dui-view'))
  assert.ok(box.querySelector('.dui-widget-metric'))
  await unmount()
})
