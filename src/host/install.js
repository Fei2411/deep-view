// Deep UI's host half: the show_view tool, the pending store, the /api/deep-ui
// route the cards answer through, and the user-message revoke.
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { checkShownView, validateViewAnswer } from '../core/views.js'
import { showViewParameters, showViewDescription } from '../core/tool-schema.js'
import { viewReply } from '../core/reply.js'
import { createPendingStore } from './pending.js'

export const ROUTE = '/api/deep-ui'

const output = {
  schema: { type: 'string' },
  render: (args, value) => [{ type: 'text', text: String(value) }],
}

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const ok = value => ({ ok: true, value })
const fail = (message, code = 'deep-ui/error') => ({ ok: false, error: { code, message, details: {} } })

export function install(ctx, config = {}) {
  const home = config.home ?? join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'deep-ui')
  const pending = createPendingStore(home)

  // Interactive views ask a human, so only the live runtime root may open one —
  // the same boundary dsh-user-questions draws for ask_user_question. Without
  // the registry nothing can prove a delegated caller, so only a real non-root
  // agent is refused.
  const assertLiveRoot = (agent) => {
    const agents = ctx.get('agents')
    if (agents !== undefined && (agent === undefined || agents.get(agent.id) !== agent || !agents.roots().includes(agent))) {
      return 'A view that waits for the user only works in a root session; include the unanswered question or decision in your final result.'
    }
    return undefined
  }

  ctx.tools.register(defineTool({
    name: 'show_view',
    description: showViewDescription({ where: 'the chat', placement: 'It appears under your reply for this turn.' }),
    parameters: showViewParameters,
    output,
    async execute(args, exec) {
      await pending.load()
      const checked = checkShownView(args.title, args.view)
      if (checked.error !== undefined) return checked.error
      if (!checked.interactive && args.await_reply === true) return 'This view has nothing to submit; call show_view with await_reply: false.'
      if (checked.interactive && args.await_reply === false) return 'This view has controls to submit, so it waits for the user\'s answer; call show_view without await_reply: false.'
      const awaitReply = args.await_reply ?? checked.interactive
      if (!awaitReply) return 'The view is on screen.'
      const refused = assertLiveRoot(exec.agent)
      if (refused !== undefined) return refused
      const sessionId = exec.agent?.session?.id
      if (typeof sessionId !== 'string') return 'This view cannot wait for the user here; include the question in your reply instead.'
      try {
        await pending.set(sessionId, {
          id: randomUUID(),
          ...(exec.callId ? { callId: exec.callId } : {}),
          title: checked.title,
          view: checked.view,
          askedAt: Date.now(),
        })
      } catch (error) {
        return `The view could not be kept open for an answer: ${error?.message ?? error}`
      }
      exec.concludeTurn?.()
      return 'The view is on screen; the user\'s answer arrives as their next message.'
    },
  }))

  // Any user message or card answer admitted into a session drops its pending
  // view: the open card leaves the page without a reload.
  ctx.on('session/event', (session, event) => {
    const id = session?.id
    if (id === undefined || event?.type !== 'user/message') return
    const kind = event.data?.source?.kind
    if (kind === 'user' || kind === 'user-question-reply') void pending.drop(id).catch(() => {})
  })

  const handle = async (op, body) => {
    try {
      await pending.load()
      const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : undefined
      switch (op) {
        case 'pending':
          return ok(sessionId === undefined ? null : (pending.get(sessionId) ?? null))
        case 'dismiss':
          if (sessionId === undefined) return fail('Nothing to dismiss', 'deep-ui/invalid')
          await pending.drop(sessionId)
          return ok(true)
        case 'reply': {
          if (sessionId === undefined) return fail('Nothing to send', 'deep-ui/invalid')
          const record = pending.get(sessionId)
          if (record === undefined || record.id !== body.viewId) return fail('This view is no longer open', 'deep-ui/stale')
          const checked = validateViewAnswer(record.view, body.action, body.values)
          if (checked.error !== undefined) return fail(checked.error, 'deep-ui/invalid')
          const reply = viewReply(record, body.action, body.values, 'user')
          if (reply === undefined) return fail('Nothing to send', 'deep-ui/invalid')
          // Claim the view before queueing so a second answer is refused.
          await pending.drop(sessionId)
          try {
            const resolved = await ctx.sessionController.resolveAgent(sessionId)
            if (resolved.agent === undefined) throw new Error(resolved.error?.message ?? 'the session is not live')
            resolved.agent.followup(createUserMessage({ content: [{ type: 'text', text: reply.text }], source: reply.source }))
            await ctx.sessions.flush(resolved.agent.session)
          } catch (error) {
            await pending.set(sessionId, record)
            throw error
          }
          return ok(true)
        }
        default:
          return fail(`Unknown op ${op}`, 'deep-ui/not-found')
      }
    } catch (error) {
      return fail(error?.message ?? String(error), 'deep-ui/internal')
    }
  }

  // An exact Fetch route on the shared /api channel; the browser authenticates
  // with its session cookie.
  ctx.effect(() => ctx.connection.fetch.register({
    path: ROUTE,
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: async (request) => {
      let body
      try { body = await request.json() } catch { body = {} }
      const result = await handle(String(body?.op ?? ''), isRecord(body) ? body : {})
      return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } })
    },
  }), 'deep-ui: api route')
}
