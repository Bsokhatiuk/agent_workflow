import { v7 } from "uuid";

// UUIDv7: time-sortable, generated in the app.
export function newId(): string {
  return v7();
}
