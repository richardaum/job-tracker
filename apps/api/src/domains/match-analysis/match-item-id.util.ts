import { randomUUID } from "node:crypto";

export function createMatchItemId(): string {
  return randomUUID();
}
