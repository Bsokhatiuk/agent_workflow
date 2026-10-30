---
status: Accepted
owner: "Bohdan Sokhatiuk"
reviewers: []
updated_at: "2026-10-30"
feature_size: ""
ticket: ""
---

# 0001 — Use a TypeScript pnpm monorepo with a single deployable server

- **Status:** Accepted
- **Date:** 2026-10-30
- **Deciders:** Bohdan Sokhatiuk (owner), with Claude during the greenfield `survey` session

## Context

The project is a solo course pet project with a budget of under one month. It must ship four things: a working Telegram bot, clean architecture, a designed UX, and tests with CI and a deployment (`docs/idea-brief.md` §4). The UI is a Telegram Mini App for all roles behind one shared bot (brief §5). That means the project needs a web frontend, an HTTP API and a bot handler, and every extra runtime or deployment unit costs scarce time.

## Decision drivers

- Solo, under one month: minimize the number of languages, toolchains and deployment units (brief §4).
- The Mini App frontend is necessarily JavaScript/TypeScript (brief §5, Q6).
- The owner named TypeScript (Node.js) as the preferred backend language (survey G3).
- Tests, CI and a deployment are required success criteria (brief §4).

## Considered options

1. **TypeScript monorepo, one server process.** Fastify API, grammY bot webhook and the static Mini App build all ship in one Node.js service; pnpm workspaces hold `apps/server`, `apps/web` and `packages/shared`.
2. **Python backend (FastAPI + aiogram) with a TypeScript frontend.** Two languages and two toolchains.
3. **Go backend with a TypeScript frontend.** Two languages and more boilerplate for a solo month.
4. **TypeScript, with the bot as a separate process or service.** Cleaner isolation, but two deployment units.

## Decision outcome

**Chosen:** Option 1. One language end to end lets server and client share the zod API schemas, and there is a single CI pipeline. One process and one Docker image keep deployment to a single unit. All of this serves the solo, one-month driver directly.

## Consequences

**Positive**
- Shared types and validation between Mini App and API (`packages/shared`), so the two cannot drift apart unnoticed.
- One Docker image and one PaaS service. The deployment platform stays a reversible choice.
- One toolchain: pnpm, Vitest, Biome, tsc.

**Negative**
- The bot and the API share a process. A crash or a slow handler in one affects the other. Acceptable for a closed demo.
- Monorepo tooling (pnpm workspaces, per-package `tsconfig`) adds some setup in scaffold.
- Node.js single-threaded CPU work: slot search must stay cheap. It is bounded to a one-week horizon (raw idea).
