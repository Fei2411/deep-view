# Deep View

Deep View is a [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that lets any agent draw interactive views in the chat: charts, key numbers, tables, small calculators the user can try values in, and choices, confirmations or short forms. Structured answers that are awkward as Markdown — a comparison chart, a what-if slider, a pick-one prompt — become a card in the conversation.

It is the standalone home of the `show_view` feature that DS Bot ships for its Bots, and it holds the shared core (`src/core`) and the presentational widgets (`src/react`) that other hosts can build on.

## Install

Add the package to the DSH profile's plugins (Desktop's plugin UI, or a `cordis.patch.yml`):

```yaml
- insert:
    - id: deep-view
      name: deep-view
```

Then restart the session. `show_view` appears in every agent's tool list.

With DS Bot, use a DS Bot version newer than 0.2.3; with older versions Deep View installs but its `show_view` tool stays off.

## What an agent can draw

The `view` argument is one declarative component; `stack`/`row` lay out children.

- Display: `text`, `metric`, `table`, `chart` (bar, hbar, line, area, donut), `progress`, `callout`, `sources`, and `html` (sandboxed markup for what the catalog cannot draw — no network, no app access, no way to answer).
- Inputs, which recompute in the page with no model call: `slider`, `number`, `choice`, `toggle`.
- Answers, which end the agent's turn and arrive as the user's next message: `options`, `confirm`, `form`, `submit`.
- Formulas (`{ "=": "expression" }`) over input ids and `let` names wire inputs to display values, e.g. a calculator.

A display-only view returns immediately. A view with answer controls waits: the card stays open until the user answers or sends another message, and the answer arrives as a regular user message — the agent's next turn sees it in the transcript. An open card goes away when the user sends any message, without a page reload.

Only the session's root agent can open a view that waits for the user; a delegated (sub-) agent is refused and told to put the decision in its final result.

## Development

```sh
npm ci                                 # build tool only (esbuild)
npm run harness                        # once: the DSH packages for the tests and the linter
npm run build                          # src/client → client.js
node --import ./test/harness-resolve.mjs --test --test-timeout=120000 "test/*.test.js"
node scripts/build-client.mjs --check  # client.js matches src/client
npm run lint                           # oxlint
```

`client.js` is generated: change `src/client/`, then `npm run build` and commit both. The mock model for a live run needs no key: `node dev/mock-llm.mjs 8787`.

## License

Apache-2.0. The view components and the shared core were ported from [DS Bot](https://github.com/Fei2411/DS-Bot), same license.
