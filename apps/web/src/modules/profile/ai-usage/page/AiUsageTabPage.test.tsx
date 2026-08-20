import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortalSlotsProvider } from "react-portalslots";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AiUsageTabPage from "./AiUsageTabPage";

const useAiUsageQueryMock = vi.fn();
const refetchMock = vi.fn();

vi.mock("@/gql/hooks", () => ({ useAiUsageQuery: () => useAiUsageQueryMock() }));

function usageQueryResult(
  options: {
    hasOpenAiKey?: boolean;
    loading?: boolean;
    personalKey?: { inputTokens: number; outputTokens: number; totalTokens: number; calls: number };
    trial?: { inputTokens: number; outputTokens: number; totalTokens: number; calls: number };
    trialCallsUsed?: number;
    trialCallsLimit?: number;
  } = {},
) {
  return {
    loading: options.loading ?? false,
    error: undefined,
    refetch: refetchMock,
    data: {
      settings: { hasOpenAiKey: options.hasOpenAiKey ?? true },
      aiUsage: {
        personalKey: options.personalKey ?? { inputTokens: 1_000, outputTokens: 400, totalTokens: 1_400, calls: 8 },
        trial: options.trial ?? { inputTokens: 200, outputTokens: 50, totalTokens: 250, calls: 3 },
        trialCallsUsed: options.trialCallsUsed ?? 7,
        trialCallsLimit: options.trialCallsLimit ?? 20,
      },
    },
  };
}

describe("AiUsageTabPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    refetchMock.mockResolvedValue({});
    useAiUsageQueryMock.mockReturnValue(usageQueryResult());
  });

  it("renders both source areas with total, input, output, and call metrics", () => {
    renderPage();

    const personalArea = screen.getByRole("region", { name: "Personal OpenAI Key Usage" });
    expect(within(personalArea).getByText("1,400")).toBeInTheDocument();
    expect(within(personalArea).getByText("1,000")).toBeInTheDocument();
    expect(within(personalArea).getByText("400")).toBeInTheDocument();
    expect(within(personalArea).getByText("8")).toBeInTheDocument();
    expect(within(personalArea).getByText("Total tokens")).toBeInTheDocument();
    expect(within(personalArea).getByText("Input tokens")).toBeInTheDocument();
    expect(within(personalArea).getByText("Output tokens")).toBeInTheDocument();
    expect(within(personalArea).getByText("Calls")).toBeInTheDocument();

    const trialArea = screen.getByRole("region", { name: "AI Trial Usage" });
    expect(within(trialArea).getByText("250")).toBeInTheDocument();
    expect(within(trialArea).getByText("200")).toBeInTheDocument();
    expect(within(trialArea).getByText("50")).toBeInTheDocument();
    expect(within(trialArea).getByText("3")).toBeInTheDocument();
  });

  it("renders trial calls used, limit, and calculated remaining separately", () => {
    renderPage();

    const trialArea = screen.getByRole("region", { name: "AI Trial Usage" });
    expect(within(trialArea).getByText("Calls used")).toBeInTheDocument();
    expect(within(trialArea).getByText("7")).toBeInTheDocument();
    expect(within(trialArea).getByText("Call limit")).toBeInTheDocument();
    expect(within(trialArea).getByText("20")).toBeInTheDocument();
    expect(within(trialArea).getByText("Calls remaining")).toBeInTheDocument();
    expect(within(trialArea).getByText("13")).toBeInTheDocument();
  });

  it("refreshes through the query refetch path and exposes refresh loading", async () => {
    const user = userEvent.setup();
    const { rerender } = renderPage();

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    expect(refetchMock).toHaveBeenCalledOnce();

    useAiUsageQueryMock.mockReturnValue(usageQueryResult({ loading: true }));
    rerender(
      <PortalSlotsProvider>
        <AiUsageTabPage />
      </PortalSlotsProvider>,
    );
    expect(screen.getByRole("button", { name: "Refresh" })).toHaveAttribute("aria-busy", "true");
  });

  it("shows an accessible initial loading state", () => {
    useAiUsageQueryMock.mockReturnValue({ loading: true, data: undefined, error: undefined, refetch: refetchMock });
    renderPage();
    expect(screen.getByRole("status", { name: "Loading AI usage" })).toBeInTheDocument();
  });

  it("explains missing personal key while keeping trial usage visible", () => {
    useAiUsageQueryMock.mockReturnValue(usageQueryResult({ hasOpenAiKey: false }));
    renderPage();

    expect(screen.getByText("No personal OpenAI key saved")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add OpenAI key" })).toHaveAttribute("href", "/profile/ai/settings");
    expect(screen.getByRole("region", { name: "AI Trial Usage" })).toBeInTheDocument();
  });

  it("makes personal-key and trial zero-data states clear", () => {
    const zeroTotals = { inputTokens: 0, outputTokens: 0, totalTokens: 0, calls: 0 };
    useAiUsageQueryMock.mockReturnValue(usageQueryResult({ personalKey: zeroTotals, trial: zeroTotals }));
    renderPage();

    expect(screen.getByText("No personal-key usage has been recorded in the last 30 days.")).toBeInTheDocument();
    expect(screen.getByText("No AI Trial token usage has been recorded in the last 30 days.")).toBeInTheDocument();
  });

  it("shows an exhausted state without allowing negative remaining calls", () => {
    useAiUsageQueryMock.mockReturnValue(usageQueryResult({ trialCallsUsed: 24, trialCallsLimit: 20 }));
    renderPage();

    const trialArea = screen.getByRole("region", { name: "AI Trial Usage" });
    expect(within(trialArea).getByText("0")).toBeInTheDocument();
    expect(within(trialArea).getByText("Your AI Trial calls are exhausted.")).toBeInTheDocument();
  });

  it("shows an unavailable state with a retry control when initial loading fails", async () => {
    const user = userEvent.setup();
    useAiUsageQueryMock.mockReturnValue({
      loading: false,
      data: undefined,
      error: new Error("network unavailable"),
      refetch: refetchMock,
    });
    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent("AI usage is temporarily unavailable");
    await user.click(screen.getByRole("button", { name: "Refresh" }));
    expect(refetchMock).toHaveBeenCalledOnce();
  });

  it("keeps stale usage visible when a refresh fails", () => {
    useAiUsageQueryMock.mockReturnValue({ ...usageQueryResult(), error: new Error("refresh failed") });
    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent("Refresh failed. The usage shown below may be out of date.");
    expect(screen.getByRole("region", { name: "Personal OpenAI Key Usage" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "AI Trial Usage" })).toBeInTheDocument();
  });
});

function renderPage() {
  return render(
    <PortalSlotsProvider>
      <AiUsageTabPage />
    </PortalSlotsProvider>,
  );
}
