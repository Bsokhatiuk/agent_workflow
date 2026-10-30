---
status: Accepted
owner: "Bohdan Sokhatiuk"
reviewers: []
updated_at: "2026-10-30"
feature_size: ""
ticket: ""
---

# 0003 — Use PostgreSQL with Kysely and paired up/down migrations

- **Status:** Accepted
- **Date:** 2026-10-30
- **Deciders:** Bohdan Sokhatiuk (owner), with Claude during the greenfield `survey` session

## Context

The data is relational:
- organization → services and employees;
- a many-to-many link between employees and services;
- schedules per employee;
- bookings that reference a client, an employee and a service.

Bookings are never physically deleted; only their status changes (raw idea). Known gaps include the lack of an overlap check and of timezone handling (raw idea). The SDD pipeline's `data-model` stage generates paired forward and rollback migrations.

## Decision drivers

- Relational integrity across organizations, staff, services and bookings (raw idea, "Сутності").
- Overlap prevention needs a database safety net as well as domain checks: unique and exclusion constraints on time ranges (raw idea, "Відомі прогалини").
- Paired up/down migrations, to match the pipeline's `data-model` stage.
- TypeScript type safety for queries without heavy ORM magic (ADR-0001).

## Considered options

1. **PostgreSQL + Kysely.** A typed SQL query builder, with Kysely `Migrator` TypeScript migrations that export `up` and `down`.
2. **PostgreSQL + Prisma.** Schema-first ORM with generated client. Its migrations are forward-only, and the abstraction is heavier.
3. **PostgreSQL + Drizzle.** A typed ORM-lite whose `drizzle-kit` migrations are generated forward-only.
4. **SQLite.** Simpler locally, but it lacks Postgres range types and exclusion constraints, and managed hosting is rarer.

## Decision outcome

**Chosen:** Option 1. Kysely keeps SQL explicit, so "the database is dumb storage, invariants live in `domain/`" stays honest. Its migrator supports `down` natively, matching the pipeline's paired migrations. And Postgres gives `timestamptz` plus exclusion constraints as the overlap safety net.

## Consequences

**Positive**
- Explicit, typed queries. Migrations revert cleanly.
- `timestamptz` (UTC) plus the organization's IANA timezone covers the timezone gap. A `tstzrange` exclusion constraint can back the domain overlap check.
- Postgres runs the same in Testcontainers (tests), docker compose (local) and managed hosting (deploy).

**Negative**
- Table types for Kysely must be maintained by hand or generated (for example with `kysely-codegen`) after each migration.
- More SQL to write than with an ORM, for CRUD-heavy modules.
- Exclusion constraints need the `btree_gist` extension, which the managed Postgres host must allow. Check this when choosing the platform.
