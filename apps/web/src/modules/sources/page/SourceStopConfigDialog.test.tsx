import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn(() => false);
}

const updateSourceTemplateMock = vi.fn();

vi.mock("@/gql/hooks", async () => {
  const actual = await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return { ...actual, useUpdateSourceTemplateMutation: () => [updateSourceTemplateMock] };
});

import { SourceStopConfigDialog } from "./SourceStopConfigDialog";

function makeTemplate(config: Record<string, unknown> | null = null) {
  return {
    id: "tpl-1",
    planId: "plan-1",
    scheduleCron: null,
    scheduleEnabled: false,
    surfaceUrl: "https://example.com",
    createdAt: new Date().toISOString(),
    config: config as Record<string, unknown> | null,
    runs: [],
  };
}

describe("SourceStopConfigDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders stop conditions with checkboxes", () => {
    render(<SourceStopConfigDialog template={makeTemplate()} onOpenChange={() => {}} />);

    expect(screen.getByText("Stop Conditions")).toBeInTheDocument();
    expect(screen.getByText("CatchUp")).toBeInTheDocument();
    expect(screen.getByText("First Run Max Pages")).toBeInTheDocument();
    expect(screen.getByText("Older Than")).toBeInTheDocument();
  });

  it("shows threshold input after enabling CatchUp", async () => {
    const user = userEvent.setup();
    render(<SourceStopConfigDialog template={makeTemplate()} onOpenChange={() => {}} />);

    await user.click(screen.getByText("CatchUp"));

    expect(screen.getByPlaceholderText(/e\.g\. 5/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/e\.g\. 3/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/e\.g\. 30/i)).not.toBeInTheDocument();
  });

  it("shows maxPages input when FirstRunMaxPages config is provided", () => {
    render(
      <SourceStopConfigDialog
        template={makeTemplate({ stopWhen: "FirstRunMaxPages", maxPages: 3 })}
        onOpenChange={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText("e.g. 3")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("e.g. 5")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("e.g. 30")).not.toBeInTheDocument();
  });

  it("shows olderThanDays input when OlderThan config is provided", () => {
    render(
      <SourceStopConfigDialog
        template={makeTemplate({ stopWhen: "OlderThan", olderThanDays: 30 })}
        onOpenChange={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText("e.g. 30")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("e.g. 5")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("e.g. 3")).not.toBeInTheDocument();
  });

  it("submits correct config JSONB for CatchUp", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    updateSourceTemplateMock.mockResolvedValue({
      data: { updateSourceTemplate: { id: "tpl-1", config: { stopWhen: "CatchUp", catchUpThreshold: 5 } } },
    });

    render(<SourceStopConfigDialog template={makeTemplate()} onOpenChange={onOpenChange} />);

    await user.click(screen.getByText("CatchUp"));

    const input = screen.getByPlaceholderText("e.g. 5");
    await user.type(input, "5");

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateSourceTemplateMock).toHaveBeenCalledWith({
        variables: { id: "tpl-1", input: { config: { stopWhen: ["CatchUp"], catchUpThreshold: 5 } } },
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("shows days input after enabling OlderThan", async () => {
    const user = userEvent.setup();
    render(<SourceStopConfigDialog template={makeTemplate()} onOpenChange={() => {}} />);

    await user.click(screen.getByText("Older Than"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("e.g. 30")).toBeInTheDocument();
    });
  });

  it("pre-fills existing config on edit mode", () => {
    render(
      <SourceStopConfigDialog
        template={makeTemplate({ stopWhen: "FirstRunMaxPages", maxPages: 10 })}
        onOpenChange={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText("e.g. 3")).toBeInTheDocument();
  });
});
