/**
 * Functions executed in the **page** world via `chrome.scripting.executeScript`.
 * Must stay self-contained (no closure over module state) so Chrome can serialize them.
 */

export type DomQueryMatch = Readonly<{
  tagName: string;
  id: string;
  className: string;
  textPreview: string;
  outerHtmlPreview: string;
}>;

export type DomQueryRuntimeResult =
  | { ok: true; matches: readonly DomQueryMatch[] }
  | { ok: false; code: "INVALID_SELECTOR"; message: string };

/**
 * Query `selector` (CSS or XPath) and return a bounded list of lightweight node summaries.
 * Helpers stay nested so `executorDomQuery.toString()` is self-contained for `executeScript`.
 */
export function executorDomQuery(
  selector: string,
  limit: number,
): DomQueryRuntimeResult {
  function stripXPathPrefix(raw: string): { expr: string; explicit: boolean } {
    const t = raw.trim();
    if (/^xpath=/i.test(t)) {
      return { expr: t.replace(/^xpath=/i, "").trim(), explicit: true };
    }
    if (/^xpath:/i.test(t)) {
      return { expr: t.replace(/^xpath:/i, "").trim(), explicit: true };
    }
    return { expr: t, explicit: false };
  }

  function looksLikeXPath(expr: string): boolean {
    const t = expr.trim();
    if (t.startsWith("//")) {
      return true;
    }
    if (t.startsWith("(/") || t.startsWith("(//")) {
      return true;
    }
    if (t.startsWith("/") && t.length > 1) {
      const c = t[1];
      return c !== undefined && /[a-zA-Z_(]/.test(c);
    }
    return false;
  }

  function elementsFromXPath(
    xpathExpr: string,
    maxElements: number,
  ): Element[] {
    const out: Element[] = [];
    const snapshot = document.evaluate(
      xpathExpr,
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null,
    );
    for (
      let i = 0;
      i < snapshot.snapshotLength && out.length < maxElements;
      i++
    ) {
      const node = snapshot.snapshotItem(i);
      if (node instanceof Element) {
        out.push(node);
      }
    }
    return out;
  }

  const PREVIEW = 500;
  function trimPreview(s: string): string {
    const t = s.trim();
    return t.length > PREVIEW ? `${t.slice(0, PREVIEW)}…` : t;
  }

  const cap = Math.min(Math.max(1, limit), 200);
  const { expr, explicit } = stripXPathPrefix(selector);
  const useXPath = explicit || looksLikeXPath(expr);

  try {
    let elements: Element[];
    if (useXPath) {
      elements = elementsFromXPath(expr, cap);
    } else {
      const nodes = document.querySelectorAll(expr);
      elements = [];
      for (let i = 0; i < nodes.length && elements.length < cap; i++) {
        const el = nodes[i];
        if (el instanceof Element) {
          elements.push(el);
        }
      }
    }

    const matches: DomQueryMatch[] = [];
    for (const el of elements) {
      matches.push({
        tagName: el.tagName,
        id: el.id,
        className:
          typeof el.className === "string"
            ? el.className
            : String(el.className),
        textPreview: trimPreview(el.textContent ?? ""),
        outerHtmlPreview: trimPreview(el.outerHTML),
      });
    }
    return { ok: true, matches };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, code: "INVALID_SELECTOR", message };
  }
}

export type DomVoidRuntimeResult =
  | { ok: true }
  | { ok: false; code: "ELEMENT_NOT_FOUND" | "UNSUPPORTED_ELEMENT" };

export function executorDomFocus(selector: string): DomVoidRuntimeResult {
  function findElement(sel: string): Element | null {
    try {
      return document.querySelector(sel);
    } catch {
      return null;
    }
  }
  const el = findElement(selector);
  if (el == null) {
    return { ok: false, code: "ELEMENT_NOT_FOUND" };
  }
  if (el instanceof HTMLElement) {
    el.focus();
    return { ok: true };
  }
  return { ok: false, code: "UNSUPPORTED_ELEMENT" };
}

export function executorDomClick(selector: string): DomVoidRuntimeResult {
  function findElement(sel: string): Element | null {
    try {
      return document.querySelector(sel);
    } catch {
      return null;
    }
  }
  const el = findElement(selector);
  if (el == null) {
    return { ok: false, code: "ELEMENT_NOT_FOUND" };
  }
  if (el instanceof HTMLElement) {
    el.click();
    return { ok: true };
  }
  return { ok: false, code: "UNSUPPORTED_ELEMENT" };
}

/** How the executor resolved the field caption (for debugging / ranking). */
export type InputLabelSource =
  | "aria-labelledby"
  | "aria-label"
  | "label-for"
  | "wrapping-label"
  | "placeholder"
  | "title"
  | "none";

export type DomFindInputLabelRuntimeResult =
  | { ok: true; labelText: string | null; source: InputLabelSource }
  | {
      ok: false;
      code: "INVALID_SELECTOR" | "ELEMENT_NOT_FOUND" | "UNSUPPORTED_ELEMENT";
      message?: string;
    };

/**
 * Best-effort caption for a form control: ARIA → `<label>` → weak hints.
 */
export function executorDomFindInputLabel(
  selector: string,
): DomFindInputLabelRuntimeResult {
  function normalizeLabelText(s: string): string | null {
    const t = s.replace(/\s+/g, " ").trim();
    return t.length > 0 ? t : null;
  }

  function textFromLabelElement(label: HTMLLabelElement): string {
    const clone = label.cloneNode(true) as HTMLLabelElement;
    clone
      .querySelectorAll("input, textarea, select, button")
      .forEach((n) => n.remove());
    return clone.textContent ?? "";
  }

  function resolveAriaLabelledBy(control: Element): string | null {
    const raw = control.getAttribute("aria-labelledby");
    if (raw == null || raw.trim() === "") {
      return null;
    }
    const parts: string[] = [];
    for (const id of raw.split(/\s+/)) {
      if (id === "") {
        continue;
      }
      const ref = document.getElementById(id);
      if (ref != null) {
        const t = ref.textContent?.trim();
        if (t) {
          parts.push(t);
        }
      }
    }
    return parts.length > 0 ? parts.join(" ") : null;
  }

  let el: Element | null;
  try {
    el = document.querySelector(selector);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, code: "INVALID_SELECTOR", message };
  }
  if (el == null) {
    return { ok: false, code: "ELEMENT_NOT_FOUND" };
  }

  const isControl =
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    (el instanceof HTMLElement && el.isContentEditable);

  if (!isControl) {
    return { ok: false, code: "UNSUPPORTED_ELEMENT" };
  }

  const ariaBy = normalizeLabelText(resolveAriaLabelledBy(el) ?? "");
  if (ariaBy != null) {
    return { ok: true, labelText: ariaBy, source: "aria-labelledby" };
  }

  const aria = el.getAttribute("aria-label");
  const ariaNorm = normalizeLabelText(aria ?? "");
  if (ariaNorm != null) {
    return { ok: true, labelText: ariaNorm, source: "aria-label" };
  }

  if (el.id) {
    const id = el.id;
    const forLabel = Array.from(document.querySelectorAll("label")).find(
      (node) => node.getAttribute("for") === id,
    ) as HTMLLabelElement | undefined;
    if (forLabel != null) {
      const t = normalizeLabelText(textFromLabelElement(forLabel));
      if (t != null) {
        return { ok: true, labelText: t, source: "label-for" };
      }
    }
  }

  const wrap = el.closest("label");
  if (wrap instanceof HTMLLabelElement) {
    const t = normalizeLabelText(textFromLabelElement(wrap));
    if (t != null) {
      return { ok: true, labelText: t, source: "wrapping-label" };
    }
  }

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const ph = el.getAttribute("placeholder");
    const phNorm = normalizeLabelText(ph ?? "");
    if (phNorm != null) {
      return { ok: true, labelText: phNorm, source: "placeholder" };
    }
  }

  const title = el.getAttribute("title");
  const titleNorm = normalizeLabelText(title ?? "");
  if (titleNorm != null) {
    return { ok: true, labelText: titleNorm, source: "title" };
  }

  return { ok: true, labelText: null, source: "none" };
}

export function executorDomType(
  selector: string,
  text: string,
  append: boolean,
): DomVoidRuntimeResult {
  function findElement(sel: string): Element | null {
    try {
      return document.querySelector(sel);
    } catch {
      return null;
    }
  }
  const el = findElement(selector);
  if (el == null) {
    return { ok: false, code: "ELEMENT_NOT_FOUND" };
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    if (append) {
      el.value += text;
    } else {
      el.value = text;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return { ok: true };
  }
  if (el instanceof HTMLElement && el.isContentEditable) {
    if (append) {
      el.textContent = (el.textContent ?? "") + text;
    } else {
      el.textContent = text;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return { ok: true };
  }
  return { ok: false, code: "UNSUPPORTED_ELEMENT" };
}
