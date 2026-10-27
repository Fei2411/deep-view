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
const { WidgetCard, AnsweredView, ViewUi } = await import('../src/react/index.js')
const { ShowViewCell } = await import('../src/client/cell.js')

const t = (key, data) => (data?.n !== undefined ? `${key} ${data.n}` : key)
const ui = { t, Markdown: ({ text }) => h('span', { className: 'md' }, String(text ?? '')) }

const METER = { type: 'metric', label: 'Progress', value: '70%' }
const CHOICES = { type: 'options', id: 'pick', options: [{ label: 'A' }, { label: 'B' }] }

async function render(node) {
  const box = document.createElement('div')
  document.body.appendChild(box)
  const root = createRoot(box)
  await act(async () => { root.render(h(ViewUi.Provider, { value: ui }, node)) })
  return { box, root, unmount: () => act(async () => { root.unmount(); box.remove() }) }
}

const args = object => ({ text: name => (typeof object[name] === 'string' ? object[name] : undefined), value: name => (typeof object[name] === 'string' ? undefined : object[name]) })
const setFetch = (record) => {
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options?.body ?? '{}')
    if (body.op === 'pending') return new Response(JSON.stringify({ ok: true, value: record }))
    return new Response(JSON.stringify({ ok: true, value: true }))
  }
}

test('display-only call renders the card from its arguments', async () => {
  setFetch(null)
  const { box, unmount } = await render(h(ShowViewCell, { callId: 'c1', block: { args: args({ title: 'Stats', view: METER }) }, sessionId: "s1" }))
  assert.ok(box.querySelector('.dui-view-bare'), 'bare card')
  assert.equal(box.querySelector('.dui-widget-metric-label')?.textContent, 'Progress')
  await unmount()
})

test('interactive call renders the live card while the record names it', async () => {
  setFetch({ id: 'v1', callId: 'c2', title: 'Pick', view: CHOICES, askedAt: 1 })
  const { box, unmount } = await render(h(ShowViewCell, { callId: 'c2', block: { args: args({ title: 'Pick', view: CHOICES }) }, sessionId: "s1" }))
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  assert.ok(box.querySelector('.dui-q'), 'interactive card')
  assert.ok(box.querySelector('.dui-q-opt'), 'option rows')
  await unmount()
})

test('interactive call without a matching record renders nothing', async () => {
  setFetch({ id: 'v1', callId: 'other', title: 'Pick', view: CHOICES, askedAt: 1 })
  const { box, unmount } = await render(h(ShowViewCell, { callId: 'c3', block: { args: args({ view: CHOICES }) }, sessionId: "s1" }))
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  assert.equal(box.querySelector('.dui-q'), null)
  assert.equal(box.querySelector('.dui-view-bare'), null)
  await unmount()
})

test('refused call (invalid blueprint) renders nothing', async () => {
  setFetch(null)
  const { box, unmount } = await render(h(ShowViewCell, { callId: 'c4', block: { args: args({ view: { type: 'nope' } }) }, sessionId: "s1" }))
  assert.equal(box.querySelector('.dui-view'), null)
  await unmount()
})

test('submitting an options card posts a reply and removes the card', async () => {
  const sent = []
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options?.body ?? '{}')
    if (body.op === 'pending') return new Response(JSON.stringify({ ok: true, value: { id: 'v1', callId: 'c5', view: CHOICES, askedAt: 1 } }))
    sent.push(body)
    return new Response(JSON.stringify({ ok: true, value: true }))
  }
  const { box, unmount } = await render(h(ShowViewCell, { callId: 'c5', block: { args: args({ view: CHOICES }) }, sessionId: "s1" }))
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  const option = box.querySelector('.dui-q-opt')
  assert.ok(option, 'option row present')
  // A single-select options card answers on the pick itself, no submit step.
  await act(async () => { option.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })) })
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  const reply = sent.find(body => body.op === 'reply')
  assert.ok(reply, 'reply op posted')
  assert.equal(reply.viewId, 'v1')
  assert.equal(reply.action, 'pick')
  assert.deepEqual(reply.values.selected, ['A'])
  assert.equal(box.querySelector('.dui-q'), null, 'card gone after submit')
  await unmount()
})

test('answered view renders the settled card read-only', async () => {
  const payload = JSON.stringify({
    kind: 'answer_to_pending_view', tool: 'show_view', callId: 'c6',
    views: [{ id: 'v1', title: 'Pick', view: CHOICES }],
    answers: [{ id: 'v1', action: 'pick', values: { selected: ['B'] } }],
  })
  const { box, unmount } = await render(h(AnsweredView, { node: { data: { text: payload } } }))
  assert.ok(box.querySelector('.dui-q-settled'), 'settled card')
  assert.equal(box.querySelector('.dui-q-submit'), null, 'no live controls')
  await unmount()
})

test('a WidgetCard uses the dui- class names', async () => {
  const { box, unmount } = await render(h(WidgetCard, { title: 'T', view: METER, settled: true }))
  assert.ok(box.querySelector('.dui-view'))
  assert.ok(box.querySelector('.dui-widget-metric'))
  await unmount()
})
