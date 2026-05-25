import { act, fireEvent, render, screen } from "@testing-library/react";
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
    autoMatchEnabled: boolean;
    duplicateWindowDays: number;
  }> = {},
) {
  return {
    loading: false,
    data: {
      settings: {
        __typename: "UserSetting" as const,
        id: "user-1",
        autoFillEnabled: false,
        autoSummaryEnabled: false,
        autoMatchEnabled: false,
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

  it("renders 4 settings: Auto-fill, Auto-summary, Auto-match, Duplicate window", () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);
    expect(screen.getByText("Auto-fill job fields")).toBeInTheDocument();
    expect(screen.getByText("Auto-summary")).toBeInTheDocument();
    expect(screen.getByText("Auto-match")).toBeInTheDocument();
    expect(screen.getByText("Duplicate detection window")).toBeInTheDocument();
  });

  it("renders settings descriptions", () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);
    expect(
      screen.getByText(
        "Fill job fields automatically when creating a draft from pasted content",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Generate summaries automatically when job fields change",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Run match analysis automatically when a job is created",
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
    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { autoFillEnabled: true } },
        optimisticResponse: {
          updateSettings: expect.objectContaining({
            __typename: "UserSetting",
            id: "user-1",
            autoFillEnabled: true,
            autoSummaryEnabled: false,
            autoMatchEnabled: false,
            duplicateWindowDays: 30,
          }),
        },
      }),
    );
  });

  it("toggle onChange calls updateSettings mutation — Auto-summary", async () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const switches = screen.getAllByRole("switch");
    const autoSummarySwitch = switches[1]!;

    fireEvent.click(autoSummarySwitch);
    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { autoSummaryEnabled: true } },
        optimisticResponse: {
          updateSettings: expect.objectContaining({ autoSummaryEnabled: true }),
        },
      }),
    );
  });

  it("toggle onChange calls updateSettings mutation — Auto-match", async () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const autoMatchSwitch = screen.getAllByRole("switch")[2]!;

    fireEvent.click(autoMatchSwitch);
    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { autoMatchEnabled: true } },
        optimisticResponse: {
          updateSettings: expect.objectContaining({ autoMatchEnabled: true }),
        },
      }),
    );
  });

  it("shows spinner and disables switch while saving", async () => {
    vi.useFakeTimers();
    let resolveUpdate: (() => void) | undefined;
    updateSettingsMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      }),
    );
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const autoFillSwitch = screen.getAllByRole("switch")[0]!;
    fireEvent.click(autoFillSwitch);

    expect(autoFillSwitch).toBeDisabled();
    expect(
      screen.queryByRole("status", { name: "Saving setting" }),
    ).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(
      screen.getByRole("status", { name: "Saving setting" }),
    ).toBeInTheDocument();

    await act(async () => {
      resolveUpdate?.();
      await Promise.resolve();
    });
    expect(autoFillSwitch).not.toBeDisabled();
    expect(
      screen.queryByRole("status", { name: "Saving setting" }),
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does not show spinner when save completes before delay", async () => {
    vi.useFakeTimers();
    updateSettingsMock.mockResolvedValue(undefined);
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    fireEvent.click(screen.getAllByRole("switch")[0]!);

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.queryByRole("status", { name: "Saving setting" }),
    ).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(
      screen.queryByRole("status", { name: "Saving setting" }),
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("saves duplicate window value when pressing Enter", async () => {
    updateSettingsMock.mockResolvedValue(undefined);
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const numberInput = screen.getByRole("spinbutton");
    fireEvent.change(numberInput, { target: { value: "60" } });
    fireEvent.submit(
      screen.getByRole("form", { name: "Duplicate detection window" }),
    );

    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { duplicateWindowDays: 60 } },
      }),
    );
  });

  it("shows Save when duplicate window value changes and saves on click", async () => {
    updateSettingsMock.mockResolvedValue(undefined);
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const numberInput = screen.getByRole("spinbutton");
    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton).toBeDisabled();

    fireEvent.change(numberInput, { target: { value: "60" } });
    expect(saveButton).not.toBeDisabled();
    expect(updateSettingsMock).not.toHaveBeenCalled();

    fireEvent.click(saveButton);
    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { duplicateWindowDays: 60 } },
        optimisticResponse: {
          updateSettings: expect.objectContaining({ duplicateWindowDays: 60 }),
        },
      }),
    );
  });

  it("disables Save when duplicate window value matches saved value", () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const numberInput = screen.getByRole("spinbutton");
    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.change(numberInput, { target: { value: "60" } });
    expect(saveButton).not.toBeDisabled();

    fireEvent.change(numberInput, { target: { value: "30" } });
    expect(saveButton).toBeDisabled();
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

  it("clamps duplicate window value to 1..365 range on save", async () => {
    updateSettingsMock.mockResolvedValue(undefined);
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const numberInput = screen.getByRole("spinbutton");
    fireEvent.change(numberInput, { target: { value: "500" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { duplicateWindowDays: 365 } },
      }),
    );
  });

  it("returns null when settings is null and not loading", () => {
    settingsQueryMock.mockReturnValue({
      loading: false,
      data: { settings: null },
    });
    render(<SettingsTabPage />);
    expect(screen.queryByText("Auto-fill job fields")).not.toBeInTheDocument();
  });
});
