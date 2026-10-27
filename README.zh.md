# Deep View

Deep View 是一个 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件，让任何 Agent 都能在聊天里画出交互视图：图表、关键数字、表格、用户可以自己调参数的小计算器，以及单选、确认和简短表单。用 Markdown 表达不顺的结构化回答——对比图表、可调滑块、选一题——会变成会话里的一张卡片。

它是 DS Bot 为其 Bot 提供的 `show_view` 能力的独立版本，同时沉淀了共享核心（`src/core`）和展示层组件（`src/react`），供其他宿主复用。

## 安装

把包加进 DSH profile 的插件列表（Desktop 的插件界面，或 `cordis.patch.yml`）：

```yaml
- insert:
    - id: deep-view
      name: deep-view
```

然后重开会话。每个 Agent 的工具列表里都会出现 `show_view`。

与 DS Bot 一起用时，请用 0.2.3 以上版本的 DS Bot；旧版本下 Deep View 仍会安装，但它的 `show_view` 工具不会启用。

## Agent 能画什么

`view` 参数是一个声明式组件；`stack`/`row` 负责子节点排版。

- 展示：`text`、`metric`、`table`、`chart`（bar、hbar、line、area、donut）、`progress`、`callout`、`sources`，以及 `html`（目录表达不了时的沙箱标记——无网络、无应用访问、无法回传答案）。
- 输入：在页面内即时重算、不触发模型调用：`slider`、`number`、`choice`、`toggle`。
- 回答：结束 Agent 回合、作为用户下一条消息送达：`options`、`confirm`、`form`、`submit`。
- 公式（`{ "=": "expression" }`）把输入 id 和 `let` 名字绑定到展示值，例如计算器。

纯展示的视图立即返回。带回答控件的视图会等待：卡片在用户回答或发出其他消息前保持打开，回答作为一条普通用户消息送达——Agent 的下一个回合在转录里能看到它。用户发送任何消息后，打开的卡片不需要刷新页面就会消失。

只有会话的根 Agent 能打开需要等待用户的视图；委派的子 Agent 会被拒绝，并被提示把决定放进最终结果。

## 开发

```sh
npm ci                                 # 只装构建工具（esbuild）
npm run harness                        # 一次：测试和 lint 所需的 DSH 包
npm run build                          # src/client → client.js
node --import ./test/harness-resolve.mjs --test --test-timeout=120000 "test/*.test.js"
node scripts/build-client.mjs --check  # client.js 与 src/client 一致
npm run lint                           # oxlint
```

`client.js` 是生成产物：改 `src/client/` 后跑 `npm run build` 并一起提交。本地联调的模拟模型不需要密钥：`node dev/mock-llm.mjs 8787`。

## 许可

Apache-2.0。视图组件与共享核心移植自 [DS Bot](https://github.com/Fei2411/DS-Bot)，许可相同。
