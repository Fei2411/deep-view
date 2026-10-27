# AGENTS.md

Instructions for AI coding agents that work on this repository.

## What this project is

Deep UI is a DeepSeek Harness (DSH) plugin that lets any agent draw interactive views in the chat — the `show_view` tool. `index.js` + `src/host/` are the server side (tool registration, the pending-view store, the `/api/deep-ui` route, the user-message revoke); `src/client/` is the browser side (tool view, answered-reply node, styles); `src/core/` is the pure shared blueprint/validator/reply code; `src/react/` is the presentational components (dependency-injected via the `ViewUi` context). `client.js` is generated from `src/client/` by `npm run build`.

## Hard rules

1. **Build on DSH; never patch it.** Use documented plugin APIs only. Never import files from inside a DSH install that are not exported entry points. If something is missing, stop and say so.
2. **No secrets.** Never write, print or commit API keys, tokens, cookies or `DSH_HOME` contents. Use `dev/mock-llm.mjs` for a live run; it needs no key.
3. **Only original material.** The code ported here is DS Bot's Apache-2.0 code, same license and copyright holder.
4. **`client.js` is generated.** Change `src/client/`, then run `npm run build` and commit both files. Never edit `client.js` by hand.
5. **Do not touch the user's DSH data.** Tests and live runs use an isolated `DSH_HOME` under the system temp dir, never `~/.dsh` or a running DSH.

## Commands

The unit tests and the linter load the `@deepseek-ai/*` packages from `dev/harness/`, which `npm run harness` installs at the DSH version in `dev/harness/package.json`. `DSH_HARNESS` points them at another install or a DeepSeek Harness checkout instead.

```sh
npm ci                                 # build tool only (esbuild)
npm run harness                        # once: the DSH packages for the tests and the linter
npm run build                          # src/client → client.js
node --import ./test/harness-resolve.mjs --test --test-timeout=120000 "test/*.test.js"
node scripts/build-client.mjs --check  # client.js matches src/client
npm run lint                           # oxlint
```

A change is done when the tests, the `--check` and `npm run lint` pass. Stop every process you started.

## Style

- Follow the code around your change. Keep functions small and names plain.
- Write a comment only when the reason is not clear from the code.
- Commit messages in English, imperative subject, the reason in the body. Keep commits small.
- The person who asked for the change is the commit author. Do not set an AI agent or bot as author or committer, and do not add `Co-authored-by` lines for one.
- User-facing text in the plugin is English, localized through the DSH locale service. Keep the README and README.zh.md in step when you change one of them.
