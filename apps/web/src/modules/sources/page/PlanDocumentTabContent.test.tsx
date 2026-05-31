import { render, screen, waitFor } from "@testing-library/react";
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

describe("PlanDocumentTabContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders JSON editor with plan document", async () => {
    planQueryMock.mockReturnValue({ data: { plan: defaultPlan }, loading: false });

    renderWithProviders(<PlanDocumentTabContent params={syncParamsResolved({ planId: "p-1" })} />);

    await waitFor(() => {
      expect(screen.getByText(/boardType/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Sequential/)).toBeInTheDocument();
    expect(screen.getByText(/steps/)).toBeInTheDocument();
  });

  it("renders Save button and description", async () => {
    planQueryMock.mockReturnValue({ data: { plan: defaultPlan }, loading: false });

    renderWithProviders(<PlanDocumentTabContent params={syncParamsResolved({ planId: "p-1" })} />);

    await waitFor(() => {
      expect(screen.getByText("Configure extraction rules and constraints for this plan.")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("Save button is disabled until document is modified", async () => {
    planQueryMock.mockReturnValue({ data: { plan: defaultPlan }, loading: false });

    renderWithProviders(<PlanDocumentTabContent params={syncParamsResolved({ planId: "p-1" })} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });
  });

  it("returns null when plan is null", () => {
    planQueryMock.mockReturnValue({ data: { plan: null }, loading: false });

    renderWithProviders(<PlanDocumentTabContent params={syncParamsResolved({ planId: "p-1" })} />);

    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });
});
