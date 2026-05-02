/** Built-in importer ids and the listing URL opened when a run starts (extension / manual). */
export const IMPORTER_REGISTRY: Readonly<
  Record<string, { name: string; entryUrl: string }>
> = {
  remoteyeah: {
    name: "RemoteYeah",
    entryUrl:
      "https://remoteyeah.com/remote-frontend-engineer+reactjs-jobs-in-brazil+latin-america+worldwide#jobs",
  },
};

export function resolveImporter(
  importerId: string,
): { name: string; entryUrl: string } | null {
  const key = importerId.trim().toLowerCase();
  return IMPORTER_REGISTRY[key] ?? null;
}
