import DOMPurify from "isomorphic-dompurify";

const CAPTURED_HTML_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: [
    "script",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "button",
    "textarea",
    "select",
    "meta",
    "link",
    "base",
  ],
  ALLOW_DATA_ATTR: true,
  RETURN_TRUSTED_TYPE: false,
};

/**
 * Sanitize HTML captured from job postings (paste, extension import, iframe preview).
 * Strips executable content while preserving readable structure and inline styles.
 */
export function sanitizeCapturedHtml(html: string): string {
  return DOMPurify.sanitize(html, CAPTURED_HTML_CONFIG) as string;
}
