import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn(() => false);
}

const planQueryMock = vi.fn();
const updatePlanMock = vi.fn();

vi.mock("@/gql/hooks", async () => {
  const actual = await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return { ...actual, usePlanQuery: () => planQueryMock(), useUpdatePlanMutation: () => [updatePlanMock] };
});

import { SlotsProvider } from "@job-tracker/react-slots";

import { PlanHeaderActions, PlanTabDescription } from "@/modules/sources/page/plan-details-header.slots";
import PlanDocumentTabContent from "./PlanDocumentTabContent";

/** Fulfilling thenable lets `React.use(params)` unblock without suspense in jsdom tests. */
function syncParamsResolved<T>(value: T) {
  return {
    then(resolve: (v: T) => unknown, _reject?: (reason?: unknown) => void) {
      resolve(value);
      return Promise.resolve(undefined);
    },
  } as unknown as Promise<T>;
}

const defaultPlan = {
  id: "p-1",
  displayName: "Test Plan",
  document: { steps: [], boardType: "Sequential" },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  templates: [],
};

function renderWithProviders(ui: ReactNode) {
  return render(
    <SlotsProvider>
      <PlanTabDescription.Slot />
      <PlanHeaderActions.Slot />
      {ui}
    </SlotsProvider>,
  );
}

function getDropdown() {
  return screen.getAllByRole("combobox")[0];
}

describe("PlanDocumentTabContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pre-selects existing boardType in dropdown", async () => {
    planQueryMock.mockReturnValue({ data: { plan: defaultPlan }, loading: false });

    renderWithProviders(<PlanDocumentTabContent params={syncParamsResolved({ planId: "p-1" })} />);

    await waitFor(() => {
      expect(getDropdown()).toBeInTheDocument();
    });

    expect(getDropdown()).toHaveTextContent("Sequential");
  });

  it("shows empty state when plan has no boardType", async () => {
    planQueryMock.mockReturnValue({ data: { plan: { ...defaultPlan, document: { steps: [] } } }, loading: false });

    renderWithProviders(<PlanDocumentTabContent params={syncParamsResolved({ planId: "p-1" })} />);

    await waitFor(() => {
      expect(getDropdown()).toBeInTheDocument();
    });

    expect(getDropdown()).not.toHaveTextContent("Sequential");
    expect(getDropdown()).not.toHaveTextContent("NonSequential");
  });

  it("submits boardType in document JSONB on save", async () => {
    planQueryMock.mockReturnValue({ data: { plan: { ...defaultPlan, document: { steps: [] } } }, loading: false });
    updatePlanMock.mockResolvedValue({ data: { updatePlan: { id: "p-1", displayName: "Test Plan", document: {} } } });

    renderWithProviders(<PlanDocumentTabContent params={syncParamsResolved({ planId: "p-1" })} />);

    await waitFor(() => {
      expect(getDropdown()).toBeInTheDocument();
    });

    const dropdown = getDropdown();
    fireEvent.click(dropdown);
    fireEvent.click(screen.getByText("NonSequential"));

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updatePlanMock).toHaveBeenCalledWith({
        variables: { id: "p-1", input: { document: { steps: [], boardType: "NonSequential" } } },
      });
    });
  });
});
