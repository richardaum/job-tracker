import { describe, expect, it } from "vitest";

import { sanitizeCapturedHtml } from "./sanitize-captured-html";

describe("sanitizeCapturedHtml", () => {
  it("removes script tags and inline event handlers", () => {
    const dirty =
      '<p>Role</p><script>alert(1)</script><img src=x onerror="alert(1)">';

    expect(sanitizeCapturedHtml(dirty)).not.toContain("<script");
    expect(sanitizeCapturedHtml(dirty)).not.toContain("onerror");
    expect(sanitizeCapturedHtml(dirty)).toContain("Role");
  });

  it("removes embedded browsing primitives", () => {
    const dirty =
      '<iframe src="https://evil.test"></iframe><object data="x"></object>';

    expect(sanitizeCapturedHtml(dirty)).not.toContain("<iframe");
    expect(sanitizeCapturedHtml(dirty)).not.toContain("<object");
  });

  it("preserves basic posting markup", () => {
    const clean = "<h1>Senior Engineer</h1><ul><li>React</li></ul>";

    expect(sanitizeCapturedHtml(clean)).toContain("Senior Engineer");
    expect(sanitizeCapturedHtml(clean)).toContain("<ul>");
  });
});
