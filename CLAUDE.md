# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Project conventions (telegram-booking)

Source of truth: [docs/architecture-map.md](docs/architecture-map.md) and its ADRs in `docs/adr/`. This section is the short version a new change must match.

**Layout.** pnpm workspace on Node 24 / TypeScript: `apps/server` (Fastify API + grammY bot webhook, one process), `apps/web` (React + Vite Mini App), `packages/shared` (zod schemas and inferred API types).

**Commands.** `pnpm build` · `pnpm test` (Vitest, unit + integration) · `pnpm lint` (Biome) · `pnpm typecheck` · `pnpm --filter server migrate:latest` / `migrate:down` · `docker compose up -d` for local Postgres · copy `.env.example` to `.env`.

- **Modules and layers.** A capability lives in `apps/server/src/modules/<name>/` with `domain/` (pure TypeScript, no I/O), `app/` (use cases; repositories as interfaces), `infra/` (Kysely repositories), `http/` (routes; validate with shared zod schemas). Each module exports a Fastify plugin from `http/routes.ts`, registered in `apps/server/src/main.ts`. Modules call each other only through another module's `app/` services, never its `infra/`.
- **Errors.** Domain and app code throws `AppError(code, message, httpStatus)` from `apps/server/src/shared/errors.ts`. The one error handler renders `{ "error": { "code", "message" } }`; unknown errors become `500 internal`.
- **Auth.** Every API request carries `Authorization: tma <initData>` (the web client in `apps/web/src/shared/api/client.ts` adds it). The server validates the signature with the bot token and rejects a stale `auth_date`. Roles come only from the server-side lookup, never from `start_param`.
- **IDs.** UUIDv7 generated in the app: `newId()` from `apps/server/src/shared/ids.ts`.
- **Time.** Store instants as UTC `timestamptz`. Each organization has an IANA timezone; slot and schedule math runs in that zone with Luxon inside `schedule/domain`.
- **Persistence.** Kysely with typed table interfaces in `apps/server/src/shared/db.ts`. Invariants live in `domain/`; FKs, uniqueness and exclusion constraints are the safety net. Records are never physically deleted: their status changes.
- **Migrations.** `apps/server/migrations/NNNN_<name>.ts`, each exporting `up` and `down`, run by the Kysely `Migrator`.
- **Tests.** Vitest, next to the code as `*.test.ts`; integration tests as `*.int.test.ts` against a throwaway Postgres via Testcontainers (Docker required). `schedule/domain` gets dense unit tests.
- **UI.** `@telegram-apps/telegram-ui` components themed by the Telegram `--tg-theme-*` CSS variables, CSS modules for layout, TanStack Query for server state. Screens go in `apps/web/src/pages/<role>/<screen>.tsx`; thin shared compositions in `apps/web/src/shared/ui/`. No Tailwind, no second design system.
