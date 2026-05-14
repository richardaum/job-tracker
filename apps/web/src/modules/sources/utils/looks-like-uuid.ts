/** Heuristic UUID (incl. v4-ish) detector for hiding raw IDs in the UI. */
export function looksLikeUuid(value: string): boolean {
  return /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(
    value.trim(),
  );
}
