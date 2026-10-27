// The DeepSeek Harness needs a model; this is a fake one. It speaks the
// Anthropic Messages API over SSE on a port, and answers fixed commands so a
// show_view scenario runs with no key and no network.
//
//   node dev/mock-llm.mjs [port]    (default 8787; PORT env also works)
//
// Commands (last user message decides):
//   view options   interactive options card, waits for the user's pick
//   view form      interactive form card
//   view display   display-only metrics + table card
//   view chart     a bar chart card
//   view calc      a slider driving a formula metric
//   view html      a sandboxed html card
//   view big       an oversized blueprint the tool refuses
//   anything else  a short text reply (tool results get a follow-up line)
import { appendFileSync } from 'node:fs'
import { createServer } from 'node:http'

const PORT = Number(process.env.PORT ?? process.argv[2] ?? 8787)
const LOG = process.env.MOCK_LOG ?? ''
const textOf = content => typeof content === 'string' ? content
  : Array.isArray(content) ? content.map(block => (block.type === 'text' ? block.text : '')).join('\n') : ''

const text = value => ({ type: 'text', text: value })
const tool = (name, input) => ({ type: 'tool_use', name, input })
const isResults = message => Array.isArray(message?.content) && message.content.some(block => block.type === 'tool_result')
const isViewAnswer = message => {
  const raw = textOf(message?.content)
  try { return JSON.parse(raw)?.kind === 'answer_to_pending_view' } catch { return false }
}

function decide(body) {
  const tools = new Set((body.tools ?? []).map(entry => entry.name))
  const last = (body.messages ?? []).at(-1)
  if (last?.role === 'user' && isResults(last)) {
    const result = last.content.find(block => block.type === 'tool_result')
    const resultText = textOf(result?.content)
    return [text(resultText.startsWith('The view is on screen') ? 'The view is above; take a look.' : `The view call was refused: ${resultText}`)]
  }
  if (last?.role === 'user' && isViewAnswer(last)) {
    try {
      const reply = JSON.parse(textOf(last.content))
      return [text(`Got your answer: ${JSON.stringify(reply.answers?.[0]?.values ?? {})}. Done here.`)]
    } catch { return [text('Thanks.')] }
  }
  const command = textOf(last?.content).trim().toLowerCase()
  if (!tools.has('show_view')) return [text('show_view is not registered here.')]
  if (command.startsWith('view options')) {
    return [text('Pick a lane:'), tool('show_view', { title: 'Pick a lane', view: { type: 'options', id: 'lane', options: [{ label: 'Ship now', description: 'It is good enough' }, { label: 'One more pass' }, { label: 'Sleep on it' }] } })]
  }
  if (command.startsWith('view form')) {
    return [tool('show_view', { title: 'A few details', view: { type: 'form', id: 'ask', submitLabel: 'Send', fields: [{ id: 'name', label: 'Name', placeholder: 'Ada' }, { id: 'note', label: 'Note' }] } })]
  }
  if (command.startsWith('view display')) {
    return [text('Here are the numbers (sample data):'), tool('show_view', {
      title: 'Sprint summary',
      view: {
        type: 'stack', children: [
          { type: 'row', children: [{ type: 'metric', label: 'Merged', value: '42', tone: 'good' }, { type: 'metric', label: 'Open', value: '7', tone: 'warn' }, { type: 'metric', label: 'Blocked', value: '1', tone: 'bad' }] },
          { type: 'table', columns: [{ key: 'name', label: 'Task' }, { key: 'state', label: 'State' }, { key: 'days', label: 'Days' }], rows: [['API route', 'merged', 3], ['UI pass', 'open', 5], ['Import job', 'blocked', 9]] },
          { type: 'callout', text: 'Sample data for the demo, not a real sprint.', tone: 'info' },
        ],
      },
      await_reply: false,
    })]
  }
  if (command.startsWith('view chart')) {
    return [text('B is fastest, D slowest — first-token latency in ms (sample data):'), tool('show_view', {
      view: { type: 'chart', kind: 'bar', categories: ['A', 'B', 'C', 'D'], series: [{ name: 'ms', values: [820, 640, 910, 1200] }], unit: 'ms', caption: 'Four runs each, median.' },
      await_reply: false,
    })]
  }
  if (command.startsWith('view calc')) {
    return [text('Drag the slider to see the monthly cost:'), tool('show_view', {
      title: 'Cost calculator',
      view: {
        type: 'stack',
        let: { monthly: 'seats * 25', yearly: 'monthly * 12' },
        children: [
          { type: 'slider', id: 'seats', label: 'Seats', min: 1, max: 50, step: 1, value: 10 },
          { type: 'row', children: [{ type: 'metric', label: 'Per month', value: { '=': 'format(monthly, 0)' }, caption: 'USD' }, { type: 'metric', label: 'Per year', value: { '=': 'format(yearly, 0)' }, caption: 'USD' }] },
        ],
      },
      await_reply: false,
    })]
  }
  if (command.startsWith('view html')) {
    return [tool('show_view', {
      title: 'Hand-drawn',
      view: { type: 'html', summary: 'a custom gauge', height: 120, html: '<div style="border:1px solid var(--view-line);border-radius:10px;padding:10px;color:var(--view-ink)"><b>Gauge</b><div id="v">0%</div><script>let n=0;const el=document.getElementById("v");const t=setInterval(()=>{n+=10;el.textContent=n+"%";if(n>=80)clearInterval(t)},200)</script></div>' },
      await_reply: false,
    })]
  }
  if (command.startsWith('view big')) {
    return [tool('show_view', { title: 'A long note', view: { type: 'stack', children: [0, 1, 2, 3].map(() => ({ type: 'text', text: 'x'.repeat(1900) })) }, await_reply: false })]
  }
  return [text(`You said "${command.slice(0, 80) || 'hello'}". Try: view options, view form, view display, view chart, view calc, view html, view big.`)]
}

const sse = (res, value) => res.write(`data: ${JSON.stringify(value)}\n\n`)
let seq = 0

const server = createServer((req, res) => {
  const path = req.url.split('?')[0]
  if (req.method === 'GET' && path.endsWith('/v1/models')) {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ data: [{ type: 'model', id: 'mock-model', display_name: 'Mock Model' }], has_more: false }))
    return
  }
  if (req.method !== 'POST' || !path.endsWith('/v1/messages')) {
    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: { message: `no route ${req.method} ${req.url}` } }))
    return
  }
  let raw = ''
  req.setEncoding('utf8')
  req.on('data', chunk => { raw += chunk })
  req.on('end', () => {
    const body = JSON.parse(raw)
    const id = ++seq
    const out = decide(body)
    if (LOG) appendFileSync(LOG, JSON.stringify({ id, tools: (body.tools ?? []).map(e => e.name), result: body.messages?.at(-1)?.role === 'user' && isResults(body.messages.at(-1)) ? JSON.stringify(body.messages.at(-1).content).slice(0, 400) : undefined, last: textOf(body.messages?.at(-1)?.content).slice(0, 300) }) + '\n')
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' })
    sse(res, { type: 'message_start', message: { id: `mock-${id}`, type: 'message', role: 'assistant', model: body.model ?? 'mock', content: [], usage: { input_tokens: 100, output_tokens: 0 } } })
    let index = 0
    let usedTool = false
    for (const block of out) {
      if (block.type === 'text') {
        if (block.text === '') continue
        sse(res, { type: 'content_block_start', index, content_block: { type: 'text', text: '' } })
        sse(res, { type: 'content_block_delta', index, delta: { type: 'text_delta', text: block.text } })
      } else {
        usedTool = true
        sse(res, { type: 'content_block_start', index, content_block: { type: 'tool_use', id: `call-${id}-${index}`, name: block.name, input: {} } })
        sse(res, { type: 'content_block_delta', index, delta: { type: 'input_json_delta', partial_json: JSON.stringify(block.input) } })
      }
      sse(res, { type: 'content_block_stop', index })
      index += 1
    }
    if (index === 0) {
      sse(res, { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } })
      sse(res, { type: 'content_block_stop', index: 0 })
    }
    sse(res, { type: 'message_delta', delta: { stop_reason: usedTool ? 'tool_use' : 'end_turn', stop_sequence: null }, usage: { output_tokens: Math.ceil(JSON.stringify(out).length / 3) } })
    sse(res, { type: 'message_stop' })
    res.end()
  })
})

server.listen(PORT, '127.0.0.1', () => console.log(`deep-ui mock on http://127.0.0.1:${server.address().port}/v1`))
