---
status: Accepted
owner: "Bohdan Sokhatiuk"
reviewers: []
updated_at: "2026-10-30"
feature_size: ""
ticket: ""
---

# 0002 — Organize the server as a modular monolith with domain/app/infra/http layers

- **Status:** Accepted
- **Date:** 2026-10-30
- **Deciders:** Bohdan Sokhatiuk (owner), with Claude during the greenfield `survey` session

## Context

The hardest logic in the product is the schedule engine:
- one or two shifts per day;
- a cyclic template of up to 4 weeks for each shift, each with its own start date;
- days off;
- a 30-minute slot grid;
- free-slot search for a given service duration;
- overlap checks.

It must also respect the organization's timezone (raw idea; brief §5–§6). The previous attempt left gaps in exactly this area, and "clean architecture" is a required success criterion (brief §2, §4).

## Decision drivers

- Clean architecture is a required, demonstrable outcome (brief §4).
- The schedule and booking rules carry the most correctness risk and need dense, fast unit tests (brief §6, risk 1).
- Solo, under one month: no distributed system, no broker (brief §4; ADR-0001).

## Considered options

1. **Modular monolith, per-module `domain/app/infra/http` layers.** Pure domain functions, use cases over repository interfaces, Kysely repositories, Fastify routes.
2. **Flat layered app** (`routes/`, `services/`, `db/`). Less structure, so domain rules tend to leak into routes and SQL.
3. **Separate microservices per domain.** Real isolation, but far too much operational cost for a solo month.

## Decision outcome

**Chosen:** Option 1. It keeps the schedule engine as pure functions that are testable without a database. It gives visible module boundaries, which can be shown as "clean architecture". And it stays a single deployable unit per ADR-0001.

## Consequences

**Positive**
- `schedule/domain` and `booking/domain` can be unit-tested exhaustively with no I/O.
- Module boundaries (`identity`, `organizations`, `services`, `staff`, `schedule`, `booking`) map one-to-one onto the brief's entities.
- Modules can later be extracted, for example for the catalog, without a rewrite.

**Negative**
- More files and indirection per feature than a flat app. Some boilerplate for small CRUD modules.
- The dependency rules are enforced by convention, not tooling: `domain` imports nothing from `infra/http`, and modules call each other only through `app/`. Reviews must check them.
