import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SettingsTabPage from "./SettingsTabPage";

const settingsQueryMock = vi.fn();
const updateSettingsMock = vi.fn();

vi.mock("@/gql/hooks", async () => {
  const actual =
    await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return {
    ...actual,
    useSettingsQuery: () => settingsQueryMock(),
    useUpdateSettingsMutation: () => [updateSettingsMock],
  };
});

function mockSettings(
  overrides: Partial<{
    autoFillEnabled: boolean;
    autoSummaryEnabled: boolean;
    duplicateWindowDays: number;
  }> = {},
) {
  return {
    loading: false,
    data: {
      settings: {
        __typename: "UserSetting" as const,
        userId: "user-1",
        autoFillEnabled: false,
        autoSummaryEnabled: false,
        duplicateWindowDays: 30,
        ...overrides,
      },
    },
  };
}

describe("SettingsTabPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("renders 3 settings: Auto-fill, Auto-summary, Duplicate window", () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);
    expect(screen.getByText("Auto-fill")).toBeInTheDocument();
    expect(screen.getByText("Auto-summary")).toBeInTheDocument();
    expect(screen.getByText("Duplicate detection window")).toBeInTheDocument();
  });

  it("renders settings descriptions", () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);
    expect(
      screen.getByText(
        "Pre-fill application fields when converting from draft",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Generate summaries automatically when job fields change",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Time range in days for detecting duplicate applications",
      ),
    ).toBeInTheDocument();
  });

  it("toggle onChange calls updateSettings mutation — Auto-fill", async () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const switches = screen.getAllByRole("switch");
    const autoFillSwitch = switches[0]!;

    fireEvent.click(autoFillSwitch);
    expect(updateSettingsMock).toHaveBeenCalledWith({
      variables: { input: { autoFillEnabled: true } },
    });
  });

  it("toggle onChange calls updateSettings mutation — Auto-summary", async () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const switches = screen.getAllByRole("switch");
    const autoSummarySwitch = switches[1]!;

    fireEvent.click(autoSummarySwitch);
    expect(updateSettingsMock).toHaveBeenCalledWith({
      variables: { input: { autoSummaryEnabled: true } },
    });
  });

  it("number input debounced 500ms", () => {
    vi.useFakeTimers();
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const numberInput = screen.getByRole("spinbutton");
    fireEvent.change(numberInput, { target: { value: "60" } });

    expect(updateSettingsMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(updateSettingsMock).toHaveBeenCalledWith({
      variables: { input: { duplicateWindowDays: 60 } },
    });

    vi.useRealTimers();
  });

  it("loading state shows placeholder", () => {
    settingsQueryMock.mockReturnValue({ loading: true, data: undefined });
    render(<SettingsTabPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("verify min=1, max=365 on input", () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);
    const numberInput = screen.getByRole("spinbutton");
    expect(numberInput).toHaveAttribute("min", "1");
    expect(numberInput).toHaveAttribute("max", "365");
  });

  it("clamps number input value to 1..365 range", () => {
    vi.useFakeTimers();
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const numberInput = screen.getByRole("spinbutton");
    fireEvent.change(numberInput, { target: { value: "500" } });

    vi.advanceTimersByTime(500);

    expect(updateSettingsMock).toHaveBeenCalledWith({
      variables: { input: { duplicateWindowDays: 365 } },
    });

    vi.useRealTimers();
  });

  it("returns null when settings is null and not loading", () => {
    settingsQueryMock.mockReturnValue({
      loading: false,
      data: { settings: null },
    });
    render(<SettingsTabPage />);
    expect(screen.queryByText("Auto-fill")).not.toBeInTheDocument();
  });
});
