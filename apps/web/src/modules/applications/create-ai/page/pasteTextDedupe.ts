export type PasteTextComparable = { readonly text: string };

export function normalizePasteTextForDedupe(text: string): string {
  return text.replace(/\r/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

export function isDuplicatePaste(
  incomingText: string,
  existing: readonly PasteTextComparable[],
): boolean {
  const key = normalizePasteTextForDedupe(incomingText);
  return existing.some(
    (item) => normalizePasteTextForDedupe(item.text) === key,
  );
}
