import { createDb, createMigrator } from "./shared/db.ts";

const direction = process.argv[2];
if (direction !== "latest" && direction !== "down") {
  console.error("usage: migrate latest|down");
  process.exit(1);
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const db = createDb(url);
const migrator = createMigrator(db);
const { error, results } = direction === "latest" ? await migrator.migrateToLatest() : await migrator.migrateDown();
for (const r of results ?? []) {
  console.log(`${r.status} ${r.direction} ${r.migrationName}`);
}
await db.destroy();
if (error) {
  console.error(error);
  process.exit(1);
}
