/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";

import {
  executorDomClick,
  executorDomFindInputLabel,
  executorDomFocus,
  executorDomQuery,
  executorDomType,
} from "./dom-injected";

describe("dom-injected", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("executorDomQuery works when recreated from source (Chrome executeScript serialization)", () => {
    document.body.innerHTML = `<div id="a">Hello</div>`;
    const factory = new Function(
      `return (${executorDomQuery.toString()})`,
    ) as () => typeof executorDomQuery;
    const copy = factory();
    const r = copy("div", 10);
    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }
    expect(r.matches).toHaveLength(1);
    expect(r.matches[0]?.textPreview).toContain("Hello");
  });

  it("executorDomQuery returns matches with previews", () => {
    document.body.innerHTML = `<div id="a" class="c">Hello world</div><span>skip</span>`;
    const r = executorDomQuery("div", 10);
    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }
    expect(r.matches).toHaveLength(1);
    expect(r.matches[0]?.tagName).toBe("DIV");
    expect(r.matches[0]?.id).toBe("a");
    expect(r.matches[0]?.textPreview).toContain("Hello");
  });

  it("executorDomQuery reports invalid selector", () => {
    const r = executorDomQuery("div:::bad", 5);
    expect(r.ok).toBe(false);
    if (r.ok) {
      return;
    }
    expect(r.code).toBe("INVALID_SELECTOR");
  });

  it("executorDomQuery resolves XPath //...", () => {
    document.body.innerHTML = `<div>a</div><div>b</div>`;
    const r = executorDomQuery("//div", 10);
    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }
    expect(r.matches).toHaveLength(2);
    expect(r.matches[0]?.textPreview).toContain("a");
    expect(r.matches[1]?.textPreview).toContain("b");
  });

  it("executorDomQuery resolves explicit xpath= prefix", () => {
    document.body.innerHTML = `<p class="x">ok</p>`;
    const r = executorDomQuery("xpath=//p[@class='x']", 5);
    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }
    expect(r.matches).toHaveLength(1);
    expect(r.matches[0]?.textPreview).toContain("ok");
  });

  it("executorDomQuery reports invalid XPath", () => {
    document.body.innerHTML = `<div />`;
    const r = executorDomQuery("//div[", 5);
    expect(r.ok).toBe(false);
    if (r.ok) {
      return;
    }
    expect(r.code).toBe("INVALID_SELECTOR");
  });

  it("executorDomFocus and click", () => {
    document.body.innerHTML = `<button type="button" id="b">Go</button>`;
    expect(executorDomFocus("#b").ok).toBe(true);
    expect(executorDomClick("#b").ok).toBe(true);
    expect(executorDomClick("#nope").ok).toBe(false);
  });

  it("executorDomType on input", () => {
    document.body.innerHTML = `<input id="i" />`;
    expect(executorDomType("#i", "abc", false).ok).toBe(true);
    const el = document.querySelector("#i") as HTMLInputElement;
    expect(el.value).toBe("abc");
    expect(executorDomType("#i", "d", true).ok).toBe(true);
    expect(el.value).toBe("abcd");
  });

  it("executorDomFindInputLabel resolves label[for]", () => {
    document.body.innerHTML = `<label for="email">Work email</label><input id="email" type="email" />`;
    const r = executorDomFindInputLabel("#email");
    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }
    expect(r.source).toBe("label-for");
    expect(r.labelText).toBe("Work email");
  });

  it("executorDomFindInputLabel resolves wrapping label", () => {
    document.body.innerHTML = `<label>Name <input id="n" type="text" /></label>`;
    const r = executorDomFindInputLabel("#n");
    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }
    expect(r.source).toBe("wrapping-label");
    expect(r.labelText).toBe("Name");
  });

  it("executorDomFindInputLabel prefers aria-labelledby", () => {
    document.body.innerHTML = `<span id="cap">Salary</span><input aria-labelledby="cap" id="s" />`;
    const r = executorDomFindInputLabel("#s");
    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }
    expect(r.source).toBe("aria-labelledby");
    expect(r.labelText).toBe("Salary");
  });

  it("executorDomFindInputLabel uses placeholder when no label", () => {
    document.body.innerHTML = `<input id="p" placeholder="City" />`;
    const r = executorDomFindInputLabel("#p");
    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }
    expect(r.source).toBe("placeholder");
    expect(r.labelText).toBe("City");
  });

  it("executorDomFindInputLabel rejects non-controls", () => {
    document.body.innerHTML = `<div id="x">nope</div>`;
    const r = executorDomFindInputLabel("#x");
    expect(r.ok).toBe(false);
    if (r.ok) {
      return;
    }
    expect(r.code).toBe("UNSUPPORTED_ELEMENT");
  });
});
