import { render, screen } from "@testing-library/react";
import { PortalSlotsProvider } from "react-portalslots";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AiSettingsTabPage from "./AiSettingsTabPage";

const settingsQueryMock = vi.fn();

vi.mock("@/gql/hooks", () => ({
  useSettingsQuery: () => settingsQueryMock(),
  useUpdateSettingsMutation: () => [vi.fn()],
  useSaveOpenAiKeyMutation: () => [vi.fn()],
  useRemoveOpenAiKeyMutation: () => [vi.fn()],
}));

function renderPage() {
  return render(
    <PortalSlotsProvider>
      <AiSettingsTabPage />
    </PortalSlotsProvider>,
  );
}

describe("AiSettingsTabPage", () => {
  beforeEach(() => {
    settingsQueryMock.mockReturnValue({
      loading: false,
      data: {
        settings: {
          id: "user-1",
          aiEnabled: true,
          autoFillEnabled: false,
          autoSummaryEnabled: false,
          autoMatchEnabled: false,
          hasOpenAiKey: false,
          duplicateWindowDays: 30,
          trialCallsUsed: 0,
          trialCallsLimit: 50,
        },
      },
    });
  });

  it("renders only AI-related settings and publishes the Settings subtab", () => {
    renderPage();

    expect(screen.getByText("AI-enabled")).toBeInTheDocument();
    expect(screen.getByText("Auto-fill job fields")).toBeInTheDocument();
    expect(screen.getByText("OpenAI API key")).toBeInTheDocument();
    expect(screen.queryByText("Duplicate detection window")).not.toBeInTheDocument();
  });
});
