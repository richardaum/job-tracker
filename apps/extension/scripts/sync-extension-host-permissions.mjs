#!/usr/bin/env node
/**
 * Writes package.json manifest.host_permissions from PLASMO_PUBLIC_API_URL
 * before Plasmo dev/build so MV3 stays least-privilege.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  computeManifestHostPermissions,
  getApiBaseUrlForManifest,
} from "./extension-host-patterns.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.resolve(__dirname, "../package.json");

const desired = computeManifestHostPermissions(getApiBaseUrlForManifest());
const pkgJson = readFileSync(pkgPath, "utf8");
/** @type {{ manifest?: { host_permissions?: string[] } }} */
const pkg = JSON.parse(pkgJson);

pkg.manifest ??= {};
pkg.manifest.host_permissions ??= [];

const same =
  pkg.manifest.host_permissions.length === desired.length &&
  pkg.manifest.host_permissions.every((x, i) => x === desired[i]);

if (!same) {
  pkg.manifest.host_permissions = desired;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}
