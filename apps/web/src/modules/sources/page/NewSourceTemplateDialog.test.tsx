import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn(() => false);
}

const createSourceTemplateMock = vi.fn();

vi.mock("@/gql/hooks", async () => {
  const actual = await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return { ...actual, useCreateSourceTemplateMutation: () => [createSourceTemplateMock] };
});

import { NewSourceTemplateDialog } from "./NewSourceTemplateDialog";

describe("NewSourceTemplateDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders stop condition dropdown", () => {
    render(<NewSourceTemplateDialog open={true} planId="plan-1" onOpenChange={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Select stop condition" })).toBeInTheDocument();
  });

  it("shows CatchUp threshold input by default", () => {
    render(<NewSourceTemplateDialog open={true} planId="plan-1" onOpenChange={() => {}} />);

    expect(screen.getByPlaceholderText("e.g. 5")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("e.g. 3")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("e.g. 30")).not.toBeInTheDocument();
  });

  it("selecting FirstRunMaxPages shows maxPages input", async () => {
    render(<NewSourceTemplateDialog open={true} planId="plan-1" onOpenChange={() => {}} />);

    const dropdown = screen.getByRole("combobox", { name: "Select stop condition" });
    fireEvent.click(dropdown);
    fireEvent.click(screen.getByText("First run max pages"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("e.g. 3")).toBeInTheDocument();
    });
    expect(screen.queryByPlaceholderText("e.g. 5")).not.toBeInTheDocument();
  });

  it("selecting OlderThan shows days input", async () => {
    render(<NewSourceTemplateDialog open={true} planId="plan-1" onOpenChange={() => {}} />);

    const dropdown = screen.getByRole("combobox", { name: "Select stop condition" });
    fireEvent.click(dropdown);
    fireEvent.click(screen.getByText("Older than"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("e.g. 30")).toBeInTheDocument();
    });
    expect(screen.queryByPlaceholderText("e.g. 5")).not.toBeInTheDocument();
  });

  it("saves correct config JSONB for CatchUp", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    createSourceTemplateMock.mockResolvedValue({
      data: {
        createSourceTemplate: {
          id: "tpl-1",
          planId: "plan-1",
          surfaceUrl: "https://example.com",
          scheduleCron: null,
          scheduleEnabled: false,
          createdAt: new Date().toISOString(),
          config: { stopWhen: "CatchUp", catchUpThreshold: 5 },
        },
      },
    });

    render(<NewSourceTemplateDialog open={true} planId="plan-1" onOpenChange={onOpenChange} />);

    await user.type(screen.getByPlaceholderText("https://…"), "https://example.com");

    const thresholdInput = screen.getByPlaceholderText("e.g. 5");
    await user.clear(thresholdInput);
    await user.type(thresholdInput, "5");

    await user.click(screen.getByRole("button", { name: "Create template" }));

    await waitFor(() => {
      expect(createSourceTemplateMock).toHaveBeenCalledWith({
        variables: {
          input: {
            planId: "plan-1",
            surfaceUrl: "https://example.com",
            config: { stopWhen: "CatchUp", catchUpThreshold: 5 },
          },
        },
        refetchQueries: ["Plans", "SourceTemplatesAll"],
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
