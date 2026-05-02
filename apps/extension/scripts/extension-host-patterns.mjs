/**
 * Chrome MV3 permission patterns derived from Job Tracker API base URL
 * (aligned with PLASMO_PUBLIC_API_URL / getApiBaseUrl()).
 */

/**
 * @param {string} rawBase Trimmed URL, with scheme (e.g. http://localhost:3101).
 * @returns {string[]} Sorted unique match patterns (e.g. http://localhost:3101/*).
 */
export function computeExtensionHostPatterns(rawBase) {
  const baseUrl = /^https?:\/\//i.test(rawBase)
    ? rawBase
    : `https://${rawBase}`;

  let u;
  try {
    u = new URL(baseUrl);
  } catch {
    throw new Error(
      `Invalid API URL for extension host_permissions: "${rawBase}". Expected a full URL.`,
    );
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error(
      `Unsupported API URL scheme (${u.protocol}) for "${rawBase}" — only http/https.`,
    );
  }

  /** @type {Set<string>} */
  const patterns = new Set();

  const scheme = u.protocol.slice(0, -1);
  /** @type {string} */
  const portSuffix = u.port ? `:${u.port}` : "";
  const hostname = u.hostname.toLowerCase();

  const add = (host) => patterns.add(`${scheme}://${host}${portSuffix}/*`);

  add(hostname);

  // Dev ergonomics: both loopback spellings behave the same on many machines.
  if (hostname === "localhost") {
    add("127.0.0.1");
  } else if (hostname === "127.0.0.1") {
    add("localhost");
  }

  return [...patterns].sort();
}

/**
 * Listing sites opened when starting an import run (`tabs.create`); keep origins aligned with API importer `entryUrl`.
 */
export const IMPORT_SITE_HOST_PERMISSIONS = Object.freeze([
  "https://remoteyeah.com/*",
]);

/**
 * Matches default in src/extension-channel/api-url.ts when env is unset.
 */
export function getApiBaseUrlForManifest() {
  const fromEnv =
    typeof process.env.PLASMO_PUBLIC_API_URL === "string"
      ? process.env.PLASMO_PUBLIC_API_URL.trim()
      : "";
  const base =
    fromEnv.length > 0 ? fromEnv.replace(/\/$/, "") : "http://localhost:3101";
  return base;
}

/**
 * Combined MV3 patterns: Job Tracker API + importer destinations.
 *
 * @param {string} [rawApiBase] Passed to {@link computeExtensionHostPatterns}; defaults from env / localhost.
 * @returns {string[]}
 */
export function computeManifestHostPermissions(rawApiBase) {
  const base =
    rawApiBase != null && String(rawApiBase).trim().length > 0
      ? String(rawApiBase).trim()
      : getApiBaseUrlForManifest();
  const apiPatterns = computeExtensionHostPatterns(base);
  return [...new Set([...apiPatterns, ...IMPORT_SITE_HOST_PERMISSIONS])].sort(
    (a, b) => a.localeCompare(b),
  );
}
