import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TITLE_TEMPLATE } from "@/app/metadata";
import { useJobPageTitle } from "@/modules/jobs/details/hooks/useJobPageTitle";

describe("useJobPageTitle", () => {
  afterEach(() => {
    document.title = "";
  });

  it("sets document.title when job data is available", () => {
    renderHook(() =>
      useJobPageTitle(
        { title: "Backend Eng", company: { name: "Acme" } },
        "description",
      ),
    );

    expect(document.title).toBe(
      TITLE_TEMPLATE.replace("%s", "Backend Eng @ Acme — Description"),
    );
  });

  it("does not overwrite document.title while job is loading", () => {
    document.title = "Initial title";

    renderHook(() => useJobPageTitle(undefined, "overview"));

    expect(document.title).toBe("Initial title");
  });

  it("updates document.title when title changes", () => {
    const { rerender } = renderHook(
      ({ title }: { title: string | null }) =>
        useJobPageTitle({ title, company: { name: "Acme" } }, "overview"),
      { initialProps: { title: "Draft" } },
    );

    expect(document.title).toBe(TITLE_TEMPLATE.replace("%s", "Draft @ Acme"));

    rerender({ title: "Backend Eng" });

    expect(document.title).toBe(
      TITLE_TEMPLATE.replace("%s", "Backend Eng @ Acme"),
    );
  });
});
