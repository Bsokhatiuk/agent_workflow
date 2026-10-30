import type { Kysely } from "kysely";

// Baseline migration: proves the migrator end to end. Feature tables start at 0002.
export async function up(_db: Kysely<unknown>): Promise<void> {}

export async function down(_db: Kysely<unknown>): Promise<void> {}
