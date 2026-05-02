const pendingOpens = new Map<string, Promise<void>>();

/**
 * Dedupes simultaneous opens; session storage skips duplicate opens per run across reconnects (cleared separately if needed).
 */
export async function openImportRunTabOnce(
  runId: string,
  entryUrl: string,
): Promise<void> {
  let opener = pendingOpens.get(runId);
  if (!opener) {
    opener = uncachedOpenImportRunTab(runId, entryUrl);
    pendingOpens.set(runId, opener);
    void opener.finally(() => pendingOpens.delete(runId));
  }

  await opener;
}

async function uncachedOpenImportRunTab(
  runId: string,
  entryUrl: string,
): Promise<void> {
  const dedupeKey = `jtImportRunOpened:${runId}`;
  const got = await chrome.storage.session.get(dedupeKey);
  if (got[dedupeKey] === true) {
    return;
  }

  await chrome.storage.session.set({ [dedupeKey]: true });

  await chrome.tabs.create({ url: entryUrl, active: true });
}
