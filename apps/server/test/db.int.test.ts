import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { type Kysely, sql } from "kysely";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, createMigrator, type Database } from "../src/shared/db.ts";

describe("database (Testcontainers Postgres)", () => {
  let container: StartedPostgreSqlContainer;
  let db: Kysely<Database>;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:17-alpine").start();
    db = createDb(container.getConnectionUri());
  }, 120_000);

  afterAll(async () => {
    await db?.destroy();
    await container?.stop();
  });

  it("connects", async () => {
    const { rows } = await sql<{ one: number }>`select 1 as one`.execute(db);
    expect(rows).toEqual([{ one: 1 }]);
  });

  it("applies and reverts the migrations", async () => {
    const migrator = createMigrator(db);

    const up = await migrator.migrateToLatest();
    expect(up.error).toBeUndefined();
    expect(up.results?.map((r) => [r.migrationName, r.status])).toEqual([["0001_init", "Success"]]);

    const down = await migrator.migrateDown();
    expect(down.error).toBeUndefined();
    expect(down.results?.map((r) => [r.migrationName, r.direction, r.status])).toEqual([
      ["0001_init", "Down", "Success"],
    ]);
  });
});
