import assert from 'node:assert/strict'
import { test } from 'node:test'
import { viewReply, readViewReply, viewAnswerText, viewReplyText } from '../src/core/reply.js'

const CHOICES = { type: 'options', id: 'pick', options: [{ label: 'Alpha', value: 'a' }, { label: 'Beta', value: 'b' }] }
const CONFIRM = { type: 'confirm', id: 'go', confirmLabel: 'Ship it', cancelLabel: 'Hold on' }
const FORM = { type: 'form', id: 'info', fields: [{ id: 'name', label: 'Name' }, { id: 'note', label: 'Note' }] }
const SLIDERS = { type: 'stack', children: [
  { type: 'slider', id: 'seats', label: 'Seats', min: 1, max: 100, value: 10 },
  { type: 'submit', id: 'go', label: 'Send' },
] }

const record = { id: 'v1', callId: 'c1', title: 'Pick', view: CHOICES }

test('viewReply defaults to the ds-bot source kind', () => {
  const reply = viewReply(record, 'pick', { selected: ['Alpha'] })
  assert.equal(reply.source.kind, 'user-question-reply')
  assert.equal(reply.source.outcome, 'answered')
  assert.equal(reply.source.callId, 'c1')
})

test('viewReply takes a plain user source kind', () => {
  const reply = viewReply(record, 'pick', { selected: ['Alpha'] }, 'user')
  assert.equal(reply.source.kind, 'user')
  // The text stays wire-compatible either way.
  const data = readViewReply(reply.text)
  assert.deepEqual(data.views[0].view, CHOICES)
  assert.deepEqual(data.answers[0].values.selected, ['Alpha'])
})

test('viewAnswerText: picked options show their labels', () => {
  const reply = viewReply(record, 'pick', { selected: ['Beta'] }, 'user')
  const data = readViewReply(reply.text)
  assert.equal(viewAnswerText(data.views[0].view, data.answers[0]), 'Beta')
})

test('viewAnswerText: confirm shows the confirm or cancel label', () => {
  const yes = viewReply({ ...record, view: CONFIRM }, 'go', { confirmed: true }, 'user')
  const no = viewReply({ ...record, view: CONFIRM }, 'go', { confirmed: false }, 'user')
  assert.equal(viewAnswerText(CONFIRM, readViewReply(yes.text).answers[0]), 'Ship it')
  assert.equal(viewAnswerText(CONFIRM, readViewReply(no.text).answers[0]), 'Hold on')
})

test('viewAnswerText: form shows label: value pairs', () => {
  const reply = viewReply({ ...record, view: FORM }, 'info', { fields: { name: 'Ada', note: 'ship friday' } }, 'user')
  assert.equal(viewAnswerText(FORM, readViewReply(reply.text).answers[0]), 'Name: Ada; Note: ship friday')
})

test('viewAnswerText: submitted inputs show label=value', () => {
  const reply = viewReply({ ...record, view: SLIDERS }, 'go', { inputs: { seats: 40 } }, 'user')
  assert.equal(viewAnswerText(SLIDERS, readViewReply(reply.text).answers[0]), 'Seats=40')
})

test('viewReplyText keeps history summaries unchanged', () => {
  const reply = viewReply(record, 'pick', { selected: ['Alpha'] }, 'user')
  assert.match(viewReplyText(reply.text), /Answer to view card.*Pick/s)
})
