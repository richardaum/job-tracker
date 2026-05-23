import { sanitizeCapturedHtml } from "@job-tracker/html-sanitize";

/**
 * Build `srcDoc` for an iframe that shows arbitrary captured posting HTML.
 * Outer `<iframe sandbox>` blocks script and most capabilities; inner CSP adds
 * defense-in-depth inside the iframe document (works with sandboxed iframe docs).
 */
export function buildCapturedHtmlSrcDoc(htmlFragment: string): string {
  const safeFragment = sanitizeCapturedHtml(htmlFragment);
  const csp = [
    "default-src 'none'",
    "img-src https: http: data: blob:",
    "style-src 'unsafe-inline'",
    "font-src https: http: data:",
    "connect-src 'none'",
    "script-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; ");

  return `<!DOCTYPE html><html lang="und"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"></head><body>${safeFragment}</body></html>`;
}
