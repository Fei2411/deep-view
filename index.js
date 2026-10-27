// Deep UI: interactive views in any DeepSeek Harness chat. The agent calls
// show_view with a declarative blueprint; the client renders it; interactive
// views wait for the user's answer, which arrives as their next message.
import { install } from './src/host/install.js'

export const name = 'deep-ui'
export const inject = ['tools', 'connection', 'sessionController', 'sessions']

export function apply(ctx, config = {}) {
  install(ctx, config)
}
