import { describe, expect, it } from "vitest";

import { sanitizeCapturedHtml } from "./sanitize-captured-html";

describe("sanitizeCapturedHtml", () => {
  it("removes script tags and inline event handlers", () => {
    const dirty = '<p>Role</p><script>alert(1)</script><img src=x onerror="alert(1)">';

    expect(sanitizeCapturedHtml(dirty)).not.toContain("<script");
    expect(sanitizeCapturedHtml(dirty)).not.toContain("onerror");
    expect(sanitizeCapturedHtml(dirty)).toContain("Role");
  });

  it("removes embedded browsing primitives", () => {
    const dirty = '<iframe src="https://evil.test"></iframe><object data="x"></object>';

    expect(sanitizeCapturedHtml(dirty)).not.toContain("<iframe");
    expect(sanitizeCapturedHtml(dirty)).not.toContain("<object");
  });

  it("removes non-content elements (style, img, video, svg, canvas, etc.)", () => {
    const dirty =
      '<style>body{color:red}</style><img src="x"><video src="y"></video><svg><circle/></svg><canvas></canvas><noscript>tracking</noscript><template><p>hidden</p></template>';

    expect(sanitizeCapturedHtml(dirty)).not.toContain("<style");
    expect(sanitizeCapturedHtml(dirty)).not.toContain("<img");
    expect(sanitizeCapturedHtml(dirty)).not.toContain("<video");
    expect(sanitizeCapturedHtml(dirty)).not.toContain("<svg");
    expect(sanitizeCapturedHtml(dirty)).not.toContain("<canvas");
    expect(sanitizeCapturedHtml(dirty)).not.toContain("<noscript");
    expect(sanitizeCapturedHtml(dirty)).not.toContain("<template");
  });

  it("strips inline style attributes", () => {
    const dirty = '<p style="color:red">Hello</p>';

    expect(sanitizeCapturedHtml(dirty)).not.toContain('style="');
  });

  it("preserves basic posting markup", () => {
    const clean = "<h1>Senior Engineer</h1><ul><li>React</li></ul>";

    expect(sanitizeCapturedHtml(clean)).toContain("Senior Engineer");
    expect(sanitizeCapturedHtml(clean)).toContain("<ul>");
  });
});
