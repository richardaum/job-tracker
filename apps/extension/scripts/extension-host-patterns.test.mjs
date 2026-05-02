import assert from "node:assert";
import test from "node:test";

import {
  computeExtensionHostPatterns,
  computeManifestHostPermissions,
} from "./extension-host-patterns.mjs";

test("manifest host_permissions include importer listing site", () => {
  assert.deepStrictEqual(
    computeManifestHostPermissions("http://localhost:3101"),
    [
      "http://127.0.0.1:3101/*",
      "http://localhost:3101/*",
      "https://remoteyeah.com/*",
    ],
  );
});

test("localhost dev API adds loopback pairing", () => {
  assert.deepStrictEqual(
    computeExtensionHostPatterns("http://localhost:3101"),
    ["http://127.0.0.1:3101/*", "http://localhost:3101/*"],
  );
});

test("explicit 127 adds localhost pairing", () => {
  assert.deepStrictEqual(
    computeExtensionHostPatterns("http://127.0.0.1:3101"),
    ["http://127.0.0.1:3101/*", "http://localhost:3101/*"],
  );
});

test("staging host yields single HTTPS pattern", () => {
  assert.deepStrictEqual(
    computeExtensionHostPatterns("https://api.example.com"),
    ["https://api.example.com/*"],
  );
});

test("staging host trims path/query are not part of pattern (URL parser)", () => {
  assert.deepStrictEqual(
    computeExtensionHostPatterns("https://api.example.com/graphql"),
    ["https://api.example.com/*"],
  );
});

test("bare hostname gets https", () => {
  assert.deepStrictEqual(computeExtensionHostPatterns("api.example.com"), [
    "https://api.example.com/*",
  ]);
});
