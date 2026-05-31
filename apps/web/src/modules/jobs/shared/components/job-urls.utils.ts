export function normalizeJobUrls(
  urls: readonly string[] | null | undefined,
): string[] {
  return (urls ?? []).map((url) => url.trim()).filter((url) => url.length > 0);
}
