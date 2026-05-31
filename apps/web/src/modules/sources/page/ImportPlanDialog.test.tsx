import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn(() => false);
}

const createPlanMock = vi.fn();

vi.mock("@/gql/hooks", async () => {
  const actual =
    await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return { ...actual, useCreatePlanMutation: () => [createPlanMock] };
});

import { ImportPlanDialog } from "./ImportPlanDialog";

describe("ImportPlanDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders board type dropdown with Sequential and NonSequential options", () => {
    render(<ImportPlanDialog open={true} onOpenChange={() => {}} />);

    const dropdown = screen.getByRole("combobox", {
      name: "Select board type",
    });
    expect(dropdown).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e\.g\. RemoteYeah/i),
    ).toBeInTheDocument();

    fireEvent.click(dropdown);
    expect(screen.getByText("Sequential")).toBeInTheDocument();
    expect(screen.getByText("NonSequential")).toBeInTheDocument();
  });

  it("disables import button when board type is not selected", () => {
    render(<ImportPlanDialog open={true} onOpenChange={() => {}} />);

    const importButton = screen.getByRole("button", { name: "Import plan" });
    expect(importButton).toBeDisabled();
  });

  it("submits boardType in document JSONB on save", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    createPlanMock.mockResolvedValue({
      data: {
        createPlan: { id: "p-1", displayName: "Test Plan", document: {} },
      },
    });

    render(<ImportPlanDialog open={true} onOpenChange={onOpenChange} />);

    await user.type(
      screen.getByPlaceholderText(/e\.g\. RemoteYeah/i),
      "Test Plan",
    );

    fireEvent.change(
      screen.getByPlaceholderText(/paste your plan document json here/i),
      { target: { value: '{"steps": []}' } },
    );

    const dropdown = screen.getByRole("combobox", {
      name: "Select board type",
    });
    fireEvent.click(dropdown);
    fireEvent.click(screen.getByText("Sequential"));

    await user.click(screen.getByRole("button", { name: "Import plan" }));

    await waitFor(() => {
      expect(createPlanMock).toHaveBeenCalledWith({
        variables: {
          input: {
            displayName: "Test Plan",
            document: { steps: [], boardType: "Sequential" },
          },
        },
        refetchQueries: ["Plans"],
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("enables import button only when board type is selected", async () => {
    const user = userEvent.setup();

    render(<ImportPlanDialog open={true} onOpenChange={() => {}} />);

    const importButton = screen.getByRole("button", { name: "Import plan" });
    expect(importButton).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText(/e\.g\. RemoteYeah/i),
      "Test Plan",
    );

    fireEvent.change(
      screen.getByPlaceholderText(/paste your plan document json here/i),
      { target: { value: '{"steps": []}' } },
    );

    expect(importButton).toBeDisabled();

    const dropdown = screen.getByRole("combobox", {
      name: "Select board type",
    });
    fireEvent.click(dropdown);
    fireEvent.click(screen.getByText("NonSequential"));

    await waitFor(() => {
      expect(importButton).not.toBeDisabled();
    });
  });
});
