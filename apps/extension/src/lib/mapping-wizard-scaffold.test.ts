import { describe, expect, it } from "vitest";

import {
  formatExtensionVersionLabel,
  MAPPING_WIZARD_SCAFFOLD,
} from "./mapping-wizard-scaffold";

describe("MAPPING_WIZARD_SCAFFOLD", () => {
  it("exposes stable scaffold copy for the side panel", () => {
    expect(MAPPING_WIZARD_SCAFFOLD.heading).toBe("Import mapping");
    expect(MAPPING_WIZARD_SCAFFOLD.panelTitle).toContain("Job Tracker");
    expect(MAPPING_WIZARD_SCAFFOLD.subheading).toContain("Wizard placeholder");
  });
});

describe("formatExtensionVersionLabel", () => {
  it("prefixes non-empty versions", () => {
    expect(formatExtensionVersionLabel("0.0.1")).toBe("v0.0.1");
  });

  it("falls back when version is blank", () => {
    expect(formatExtensionVersionLabel("   ")).toBe("v0.0.0");
  });
});
