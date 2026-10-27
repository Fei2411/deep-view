// The pending views: interactive blueprints waiting for the user's answer, one
// per session, kept in <home>/pending.json so a restart does not lose them.
import { mkdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { replaceFile } from './files.js'

export function createPendingStore(home) {
  const dir = join(home, 'deep-ui')
  const path = join(dir, 'pending.json')
  let views = null
  let writing = Promise.resolve()

  const load = async () => {
    if (views !== null) return
    let data = {}
    try { data = JSON.parse(await readFile(path, 'utf8')) } catch { data = {} }
    views = typeof data === 'object' && data !== null && !Array.isArray(data) ? data : {}
  }

  const save = () => {
    writing = writing.then(async () => {
      mkdirSync(dir, { recursive: true })
      const temp = join(dir, `pending-${process.pid}-${Date.now()}.tmp`)
      await writeFile(temp, JSON.stringify(views))
      await replaceFile(temp, path)
    }).catch(() => {})
    return writing
  }

  return {
    load,
    save,
    get: sessionId => views?.[sessionId],
    // A new pending view replaces the session's old one.
    set: (sessionId, record) => { views[sessionId] = record; return save() },
    drop: (sessionId) => {
      if (views?.[sessionId] === undefined) return Promise.resolve()
      delete views[sessionId]
      return save()
    },
    snapshot: () => ({ ...views }),
  }
}
