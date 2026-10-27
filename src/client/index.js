// Deep UI's browser half: the show_view tool view, the answered-view reply
// node, labels and the stylesheet. The host half lives in ../host.
import { createElement as h } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import { ViewUi } from '../react/ui.js'
import { DEEP_UI_CSS } from '../react/index.js'
import { ShowViewCell } from './cell.js'
import { PendingDock } from './dock.js'
import { ReplyNode, ViewReplyNode, viewReplyRule } from './reply-node.js'

const NS = 'deep-ui'

const en = {
  'Cancel': 'Cancel',
  'Confirm': 'Confirm',
  'Submit': 'Submit',
  'Send': 'Send',
  'Selected': 'Selected',
  'Dismiss': 'Dismiss',
  'Dismiss view': 'Dismiss view',
  'View': 'View',
  'View as chart': 'View as chart',
  'View as table': 'View as table',
  'Copy data': 'Copy data',
  'Download image': 'Download image',
  'Chart options': 'Chart options',
  'Chart': 'Chart',
  'Chart {n}': 'Chart {n}',
  'Copied': 'Copied',
  'Copy': 'Copy',
  'Value': 'Value',
  'Series': 'Series',
  'Sources': 'Sources',
  'Progress': 'Progress',
  'Your answer': 'Your answer',
  'This view tried to open a page and was stopped.': 'This view tried to open a page and was stopped.',
  '(skipped)': '(skipped)',
}
const zh = {
  'Cancel': '取消',
  'Confirm': '确认',
  'Submit': '提交',
  'Send': '发送',
  'Selected': '已选择',
  'Dismiss': '关闭',
  'Dismiss view': '关闭视图',
  'View': '视图',
  'View as chart': '以图表查看',
  'View as table': '以表格查看',
  'Copy data': '复制数据',
  'Download image': '下载图片',
  'Chart options': '图表选项',
  'Chart': '图表',
  'Chart {n}': '图表 {n}',
  'Copied': '已复制',
  'Copy': '复制',
  'Value': '值',
  'Series': '系列',
  'Sources': '来源',
  'Progress': '进度',
  'Your answer': '你的回答',
  'This view tried to open a page and was stopped.': '此视图试图打开页面，已被停止。',
  '(skipped)': '（已跳过）',
}

// Slot components get `t` from the locale seat; the shared widgets read it and
// the Markdown primitive through the ViewUi context.
const withUi = Component => function DeepUiView(props) {
  return h(ViewUi.Provider, { value: { t: props.t ?? (key => key), Markdown: MarkdownText } }, h(Component, props))
}

export const inject = ['slots', 'uiConversation', 'locale']

export function apply(ctx) {
  const step = (label, run) => {
    try { run() } catch (error) { console.error(`dsh-deep-ui: ${label} failed`, error) }
  }
  step('labels and styles', () => ctx.effect(() => {
    const dispose = typeof ctx.locale?.register === 'function' ? ctx.locale.register(NS, { zh, en }) : () => {}
    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-deep-ui'
    tag.dataset.pluginCss = 'dsh-deep-ui/views'
    tag.textContent = DEEP_UI_CSS
    document.head.appendChild(tag)
    return () => { dispose(); tag.remove() }
  }, 'deep-ui: labels and styles'))

  step('tool view', () => ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
    name: 'tool.call.toolview',
    key: 'show_view',
    locale: NS,
  }, withUi(ShowViewCell))))

  step('pending dock', () => ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
    name: 'conversation.composer.dock',
    id: 'deep-ui-pending',
    locale: NS,
  }, withUi(PendingDock))))

  step('reply node', () => ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node',
    key: 'question-reply',
    priority: -100,
    locale: NS,
  }, withUi(ReplyNode))))

  // A deployment without the questions UI shows the reply as plain user text;
  // the rule turns the JSON body into a card there.
  step('user text rule', () => ctx.uiConversation.userText.register(viewReplyRule))
  step('user text node', () => ctx.slots.inject('conversation.user.text.node', () => ctx.slots.register({
    name: 'conversation.user.text.node',
    key: 'deep-ui-view-reply',
    locale: NS,
  }, withUi(ViewReplyNode))))
}
