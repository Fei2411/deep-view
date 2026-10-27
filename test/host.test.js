import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { apply } from '../index.js'
import { fakeContext } from './fake-ctx.js'

const CHOICES = { type: 'options', id: 'pick', options: [{ label: 'A' }, { label: 'B' }] }
const METER = { type: 'metric', label: 'Progress', value: '70%' }

function start({ beforeApply } = {}) {
  const home = mkdtempSync(join(tmpdir(), 'deep-ui-'))
  const ctx = fakeContext()
  const sent = []
  let flushError
  Object.assign(ctx, {
    sessionController: {
      resolveAgent: async sessionId => ({ agent: { session: { id: sessionId }, followup(message) { sent.push({ sessionId, message }) } } }),
    },
    sessions: { flush: async () => { if (flushError !== undefined) throw flushError } },
  })
  const agent = { id: 'a1', root: true, session: { id: 's1' } }
  ctx.agentsRegistry.map.set('a1', agent)
  let route
  ctx.connection.fetch.register = (options) => { route = options; return async () => {} }
  beforeApply?.(ctx)
  apply(ctx, { home })
  let seq = 0
  const emit = (id, type, data) => {
    for (const listener of ctx.listeners.get('session/event') ?? []) listener({ id }, { type, seq: ++seq, data })
  }
  const exec = (over = {}) => ({ agent, callId: 'call-1', concluded: false, concludeTurn() { this.concluded = true }, ...over })
  const show = (args, execOver) => ctx.registeredTools.get('show_view').execute(args, exec(execOver))
  const call = async (op, body) => (await route.fetch(new Request(`http://localhost/api/deep-ui`, {
    method: 'POST', body: JSON.stringify({ op, ...body }),
  }))).json()
  return { ctx, emit, show, call, sent, failFlush(e) { flushError = e }, stop: async () => { rmSync(home, { recursive: true, force: true, maxRetries: 5 }) } }
}

test('a global show_view from another plugin warns instead of failing activation', async () => {
  const { ctx, call, stop } = start({ beforeApply: fake => fake.tools.register({ name: 'show_view' }) })
  try {
    assert.equal(ctx.registeredTools.has('show_view'), true, 'the foreign tool stays registered')
    assert.ok(ctx.warnings.some(line => line.includes('already provides show_view')), 'warned about the collision')
    const result = await call('pending', { sessionId: 's1' })
    assert.equal(result.ok, true, 'the rest of the plugin still works')
  } finally { await stop() }
})

test('the tool output marks its results so the client draws only its own calls', async () => {
  const { ctx, stop } = start()
  try {
    const tool = ctx.registeredTools.get('show_view')
    assert.deepEqual(tool.output.presentationMeta({ view: {} }, 'The view is on screen.'), { owner: 'dsh-deep-ui' })
  } finally { await stop() }
})

test('display-only view: valid returns on-screen text, no pending record', async () => {
  const t = start()
  const text = await t.show({ title: 'Hi', view: METER })
  assert.equal(text, 'The view is on screen.')
  assert.deepEqual(await t.call('pending', { sessionId: 's1' }), { ok: true, value: null })
  await t.stop()
})

test('validation: bad blueprint refuses with a path error', async () => {
  const t = start()
  const text = await t.show({ view: { type: 'nope' } })
  assert.match(text, /view\.type: unknown component/)
  await t.stop()
})

test('await rules: display-only cannot wait, interactive must', async () => {
  const t = start()
  assert.match(await t.show({ view: METER, await_reply: true }), /nothing to submit/)
  assert.match(await t.show({ view: CHOICES, await_reply: false }), /waits for the user/)
  await t.stop()
})

test('interactive view: root agent gets a pending record and the turn concludes', async () => {
  const t = start()
  const text = await t.show({ view: CHOICES })
  assert.equal(text, 'The view is on screen; the user\'s answer arrives as their next message.')
  const pending = (await t.call('pending', { sessionId: 's1' })).value
  assert.equal(pending.callId, 'call-1')
  assert.equal(pending.view.type, 'options')
  // A second call replaces the first.
  await t.show({ title: 'New', view: CHOICES }, { callId: 'call-2' })
  assert.equal((await t.call('pending', { sessionId: 's1' })).value.callId, 'call-2')
  assert.equal((await t.call('pending', { sessionId: 's1' })).value.title, 'New')
  await t.stop()
})

test('interactive view: a delegated agent is refused', async () => {
  const t = start()
  const child = { id: 'sub', root: false, session: { id: 's2' } }
  t.ctx.agentsRegistry.map.set('sub', child)
  const text = await t.show({ view: CHOICES }, { agent: child, callId: 'c9' })
  assert.match(text, /root session|final result/)
  assert.deepEqual(await t.call('pending', { sessionId: 's2' }), { ok: true, value: null })
  await t.stop()
})

test('interactive view: no agents registry cannot prove a delegated caller, so the view opens', async () => {
  const t = start()
  t.ctx.get = () => undefined
  const text = await t.show({ view: CHOICES }, { callId: 'c10' })
  assert.equal(text, 'The view is on screen; the user\'s answer arrives as their next message.')
  assert.equal((await t.call('pending', { sessionId: 's1' })).value.callId, 'c10')
  await t.stop()
})

test('interactive view: a failed write returns an error and the turn keeps running', async () => {
  const file = mkdtempSync(join(tmpdir(), 'deep-ui-file-'))
  const blocker = join(file, 'blocker')
  await import('node:fs/promises').then(fs => fs.writeFile(blocker, 'x'))
  const t = start()
  t.stop = async () => rmSync(file, { recursive: true, force: true, maxRetries: 5 })
  // A home inside a regular file cannot be created, so every write fails.
  const home = join(blocker, 'sub')
  const ctx = fakeContext()
  Object.assign(ctx, { sessionController: { resolveAgent: async sessionId => ({ agent: { session: { id: sessionId } } }) }, sessions: { flush: async () => {} } })
  const agent = { id: 'a1', root: true, session: { id: 's1' } }
  ctx.agentsRegistry.map.set('a1', agent)
  apply(ctx, { home })
  const text = await ctx.registeredTools.get('show_view').execute({ view: CHOICES }, { agent, callId: 'c11', concluded: false, concludeTurn() { this.concluded = true } })
  assert.match(text, /could not be kept open/)
  await t.stop()
})

test('reply: validation, stale, duplicate, restore-on-failure, success shape', async () => {
  const t = start()
  await t.show({ view: CHOICES })
  const record = (await t.call('pending', { sessionId: 's1' })).value
  // Bad answer refused without claiming.
  const bad = await t.call('reply', { sessionId: 's1', viewId: record.id, action: 'pick', values: { selected: ['Nope'] } })
  assert.equal(bad.ok, false)
  assert.match(bad.error.message, /select at least one/)
  // Stale id refused.
  const stale = await t.call('reply', { sessionId: 's1', viewId: 'other', action: 'pick', values: { selected: ['A'] } })
  assert.equal(stale.error.code, 'deep-ui/stale')
  // Flush failure restores the record.
  t.failFlush(new Error('offline'))
  const failed = await t.call('reply', { sessionId: 's1', viewId: record.id, action: 'pick', values: { selected: ['A'] } })
  assert.equal(failed.ok, false)
  assert.ok((await t.call('pending', { sessionId: 's1' })).value !== null)
  t.failFlush(undefined)
  // Success: claimed, answered message queued.
  const done = await t.call('reply', { sessionId: 's1', viewId: record.id, action: 'pick', values: { selected: ['A'] } })
  assert.deepEqual(done, { ok: true, value: true })
  // The failed flush left its follow-up queued, so the success is the second.
  assert.equal(t.sent.length, 2)
  const message = t.sent.at(-1).message
  assert.equal(message.source.kind, 'user')
  assert.equal(message.source.outcome, 'answered')
  const payload = JSON.parse(message.content[0].text)
  assert.equal(payload.kind, 'answer_to_pending_view')
  assert.deepEqual(payload.answers[0].values.selected, ['A'])
  // Duplicate refused: the record is claimed.
  const dup = await t.call('reply', { sessionId: 's1', viewId: record.id, action: 'pick', values: { selected: ['B'] } })
  assert.equal(dup.error.code, 'deep-ui/stale')
  await t.stop()
})

test('revoke: a user message or card answer drops the pending view', async () => {
  const t = start()
  await t.show({ view: CHOICES })
  t.emit('s1', 'user/message', { source: { kind: 'schedule' } })
  assert.ok((await t.call('pending', { sessionId: 's1' })).value !== null)
  t.emit('s1', 'user/message', { source: { kind: 'user' } })
  assert.deepEqual(await t.call('pending', { sessionId: 's1' }), { ok: true, value: null })
  await t.show({ view: CHOICES })
  t.emit('s1', 'user/message', { source: { kind: 'user-question-reply' } })
  assert.deepEqual(await t.call('pending', { sessionId: 's1' }), { ok: true, value: null })
  await t.stop()
})

test('dismiss drops the pending view', async () => {
  const t = start()
  await t.show({ view: CHOICES })
  assert.deepEqual(await t.call('dismiss', { sessionId: 's1' }), { ok: true, value: true })
  assert.deepEqual(await t.call('pending', { sessionId: 's1' }), { ok: true, value: null })
  await t.stop()
})
