import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SettingsTabPage from "./SettingsTabPage";

const settingsQueryMock = vi.fn();
const updateSettingsMock = vi.fn();

vi.mock("@/gql/hooks", () => ({
  useSettingsQuery: () => settingsQueryMock(),
  useUpdateSettingsMutation: () => [updateSettingsMock],
}));

function mockSettings(duplicateWindowDays = 30) {
  return {
    loading: false,
    data: {
      settings: {
        __typename: "UserSetting" as const,
        id: "user-1",
        autoFillEnabled: false,
        autoSummaryEnabled: false,
        autoMatchEnabled: false,
        aiEnabled: true,
        hasOpenAiKey: false,
        duplicateWindowDays,
        trialCallsUsed: 0,
        trialCallsLimit: 50,
      },
    },
  };
}

describe("SettingsTabPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders only the non-AI duplicate detection setting", () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    expect(screen.getByText("Duplicate detection window")).toBeInTheDocument();
    expect(screen.queryByText("Auto-fill job fields")).not.toBeInTheDocument();
    expect(screen.queryByText("OpenAI API key")).not.toBeInTheDocument();
  });

  it("saves a changed duplicate window", () => {
    updateSettingsMock.mockResolvedValue(undefined);
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "60" } });
    fireEvent.submit(screen.getByRole("form", { name: "Duplicate detection window" }));

    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { input: { duplicateWindowDays: 60 } } }),
    );
  });

  it("clamps the duplicate window to the supported range", () => {
    updateSettingsMock.mockResolvedValue(undefined);
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "500" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { input: { duplicateWindowDays: 365 } } }),
    );
  });
});
