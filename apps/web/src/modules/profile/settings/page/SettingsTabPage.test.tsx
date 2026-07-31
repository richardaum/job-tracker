import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SettingsTabPage from "./SettingsTabPage";

const settingsQueryMock = vi.fn();
const updateSettingsMock = vi.fn();
const saveOpenAiKeyMock = vi.fn();
const removeOpenAiKeyMock = vi.fn();

vi.mock("@/gql/hooks", async () => {
  const actual = await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return {
    ...actual,
    useSettingsQuery: () => settingsQueryMock(),
    useUpdateSettingsMutation: () => [updateSettingsMock],
    useSaveOpenAiKeyMutation: () => [saveOpenAiKeyMock],
    useRemoveOpenAiKeyMutation: () => [removeOpenAiKeyMock],
  };
});

function mockSettings(
  overrides: Partial<{
    autoFillEnabled: boolean;
    autoSummaryEnabled: boolean;
    autoMatchEnabled: boolean;
    aiEnabled: boolean;
    hasOpenAiKey: boolean;
    duplicateWindowDays: number;
    trialCallsUsed: number;
    trialCallsLimit: number;
    blockedKeywords: Array<{ keyword: string; scope: string; matchMode: string; __typename?: string }>;
    blockedCompanies: string[];
  }> = {},
) {
  const defaults = {
    __typename: "UserSetting" as const,
    id: "user-1",
    autoFillEnabled: false,
    autoSummaryEnabled: false,
    autoMatchEnabled: false,
    aiEnabled: true,
    hasOpenAiKey: false,
    duplicateWindowDays: 30,
    trialCallsUsed: 0,
    trialCallsLimit: 50,
    blockedKeywords: null,
    blockedCompanies: null,
  };
  return { loading: false, data: { settings: { ...defaults, ...overrides } } };
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
      screen.getByText("Fill job fields automatically when creating a draft from pasted content"),
    ).toBeInTheDocument();
    expect(screen.getByText("Generate summaries automatically when job fields change")).toBeInTheDocument();
    expect(screen.getByText("Run match analysis automatically when a job is created")).toBeInTheDocument();
    expect(screen.getByText("Time range in days for detecting duplicate applications")).toBeInTheDocument();
  });

  it("toggle onChange calls updateSettings mutation — Auto-fill", async () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const switches = screen.getAllByRole("switch");
    const autoFillSwitch = switches[1]!;

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
    const autoSummarySwitch = switches[2]!;

    fireEvent.click(autoSummarySwitch);
    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { autoSummaryEnabled: true } },
        optimisticResponse: { updateSettings: expect.objectContaining({ autoSummaryEnabled: true }) },
      }),
    );
  });

  it("toggle onChange calls updateSettings mutation — Auto-match", async () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const autoMatchSwitch = screen.getAllByRole("switch")[3]!;

    fireEvent.click(autoMatchSwitch);
    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { autoMatchEnabled: true } },
        optimisticResponse: { updateSettings: expect.objectContaining({ autoMatchEnabled: true }) },
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

    const autoFillSwitch = screen.getAllByRole("switch")[1]!;
    fireEvent.click(autoFillSwitch);

    expect(autoFillSwitch).toBeDisabled();
    expect(screen.queryByRole("status", { name: "Saving setting" })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole("status", { name: "Saving setting" })).toBeInTheDocument();

    await act(async () => {
      resolveUpdate?.();
      await Promise.resolve();
    });
    expect(autoFillSwitch).not.toBeDisabled();
    expect(screen.queryByRole("status", { name: "Saving setting" })).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does not show spinner when save completes before delay", async () => {
    vi.useFakeTimers();
    updateSettingsMock.mockResolvedValue(undefined);
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    fireEvent.click(screen.getAllByRole("switch")[1]!);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByRole("status", { name: "Saving setting" })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole("status", { name: "Saving setting" })).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("saves duplicate window value when pressing Enter", async () => {
    updateSettingsMock.mockResolvedValue(undefined);
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const numberInput = screen.getByRole("spinbutton");
    fireEvent.change(numberInput, { target: { value: "60" } });
    fireEvent.submit(screen.getByRole("form", { name: "Duplicate detection window" }));

    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { input: { duplicateWindowDays: 60 } } }),
    );
  });

  it("shows Save when duplicate window value changes and saves on click", async () => {
    updateSettingsMock.mockResolvedValue(undefined);
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const numberInput = screen.getByRole("spinbutton");
    const saveButtons = screen.getAllByRole("button", { name: "Save" });
    const duplicateWindowSaveButton = saveButtons[saveButtons.length - 1]!;
    expect(duplicateWindowSaveButton).toBeDisabled();

    fireEvent.change(numberInput, { target: { value: "60" } });
    expect(duplicateWindowSaveButton).not.toBeDisabled();
    expect(updateSettingsMock).not.toHaveBeenCalled();

    fireEvent.click(duplicateWindowSaveButton);
    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { duplicateWindowDays: 60 } },
        optimisticResponse: { updateSettings: expect.objectContaining({ duplicateWindowDays: 60 }) },
      }),
    );
  });

  it("disables Save when duplicate window value matches saved value", () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const numberInput = screen.getByRole("spinbutton");
    const saveButtons = screen.getAllByRole("button", { name: "Save" });
    const duplicateWindowSaveButton = saveButtons[saveButtons.length - 1]!;
    fireEvent.change(numberInput, { target: { value: "60" } });
    expect(duplicateWindowSaveButton).not.toBeDisabled();

    fireEvent.change(numberInput, { target: { value: "30" } });
    expect(duplicateWindowSaveButton).toBeDisabled();
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
    const saveButtons = screen.getAllByRole("button", { name: "Save" });
    fireEvent.click(saveButtons[saveButtons.length - 1]!);

    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { input: { duplicateWindowDays: 365 } } }),
    );
  });

  it("returns null when settings is null and not loading", () => {
    settingsQueryMock.mockReturnValue({ loading: false, data: { settings: null } });
    render(<SettingsTabPage />);
    expect(screen.queryByText("Auto-fill job fields")).not.toBeInTheDocument();
  });

  it("renders AI-enabled toggle and OpenAI key field", () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);
    expect(screen.getByText("AI-enabled")).toBeInTheDocument();
    expect(screen.getByText("OpenAI API key")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("sk-...")).toBeInTheDocument();
  });

  it("toggle onChange for AI-enabled calls updateSettings mutation", async () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const switches = screen.getAllByRole("switch");
    const aiEnabledSwitch = switches[0]!;

    fireEvent.click(aiEnabledSwitch);
    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { aiEnabled: false } },
        optimisticResponse: { updateSettings: expect.objectContaining({ aiEnabled: false }) },
      }),
    );
  });

  it("disables Auto-fill, Auto-summary, Auto-match, and OpenAI key when aiEnabled is false", () => {
    settingsQueryMock.mockReturnValue(mockSettings({ aiEnabled: false }));
    render(<SettingsTabPage />);

    const switches = screen.getAllByRole("switch");
    expect(switches[0]).not.toBeDisabled(); // AI-enabled toggle stays interactive
    expect(switches[1]).toBeDisabled(); // Auto-fill
    expect(switches[2]).toBeDisabled(); // Auto-summary
    expect(switches[3]).toBeDisabled(); // Auto-match
    expect(screen.getByPlaceholderText("sk-...")).toBeDisabled();
  });

  it("keeps Auto-fill, Auto-summary, Auto-match, and OpenAI key interactive when aiEnabled is true", () => {
    settingsQueryMock.mockReturnValue(mockSettings({ aiEnabled: true }));
    render(<SettingsTabPage />);

    const switches = screen.getAllByRole("switch");
    expect(switches[1]).not.toBeDisabled();
    expect(switches[2]).not.toBeDisabled();
    expect(switches[3]).not.toBeDisabled();
    expect(screen.getByPlaceholderText("sk-...")).not.toBeDisabled();
  });

  it("saving an OpenAI key calls savOpenAiKeyMutation", async () => {
    saveOpenAiKeyMock.mockResolvedValue({ data: { saveOpenAiKey: mockSettings().data.settings } });
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const keyInput = screen.getByPlaceholderText("sk-...");
    fireEvent.change(keyInput, { target: { value: "sk-test-key" } });

    const saveButtons = screen.getAllByRole("button", { name: "Save" });
    fireEvent.click(saveButtons[0]!);

    expect(saveOpenAiKeyMock).toHaveBeenCalledWith({ variables: { key: "sk-test-key" } });
  });

  it("saving an OpenAI key clears the input field on success", async () => {
    saveOpenAiKeyMock.mockResolvedValue({ data: { saveOpenAiKey: mockSettings().data.settings } });
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const keyInput = screen.getByPlaceholderText("sk-...") as HTMLInputElement;
    fireEvent.change(keyInput, { target: { value: "sk-test-key" } });

    const saveButtons = screen.getAllByRole("button", { name: "Save" });
    fireEvent.click(saveButtons[0]!);

    await act(async () => {
      await Promise.resolve();
    });

    expect(keyInput.value).toBe("");
  });

  it("shows validation error when saving an invalid OpenAI key", async () => {
    const error = Object.assign(new Error("Invalid API key"), {
      graphQLErrors: [{ extensions: { code: "AI_KEY_INVALID" }, message: "The provided API key is invalid." }],
    });
    saveOpenAiKeyMock.mockRejectedValue(error);
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const keyInput = screen.getByPlaceholderText("sk-...");
    fireEvent.change(keyInput, { target: { value: "invalid-key" } });

    const saveButtons = screen.getAllByRole("button", { name: "Save" });
    fireEvent.click(saveButtons[0]!);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("The provided API key is invalid.")).toBeInTheDocument();
  });

  it("shows Remove button when hasOpenAiKey is true", () => {
    settingsQueryMock.mockReturnValue(mockSettings({ hasOpenAiKey: true }));
    render(<SettingsTabPage />);

    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    const saveButtons = screen.queryAllByRole("button", { name: "Save" });
    expect(saveButtons).toHaveLength(1);
  });

  it("hides the key input when hasOpenAiKey is true", () => {
    settingsQueryMock.mockReturnValue(mockSettings({ hasOpenAiKey: true }));
    render(<SettingsTabPage />);

    expect(screen.queryByRole("textbox", { name: "" })).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("sk-...")).not.toBeInTheDocument();
  });

  it("shows lock icon when hasOpenAiKey is true", () => {
    settingsQueryMock.mockReturnValue(mockSettings({ hasOpenAiKey: true }));
    render(<SettingsTabPage />);

    expect(screen.getByRole("img", { name: "Encrypted" })).toBeInTheDocument();
  });

  it("clicking Remove button calls removeOpenAiKeyMutation", async () => {
    removeOpenAiKeyMock.mockResolvedValue({ data: { removeOpenAiKey: mockSettings().data.settings } });
    settingsQueryMock.mockReturnValue(mockSettings({ hasOpenAiKey: true }));
    render(<SettingsTabPage />);

    const removeButton = screen.getByRole("button", { name: "Remove" });
    fireEvent.click(removeButton);

    expect(removeOpenAiKeyMock).toHaveBeenCalled();
  });

  it("renders 6 settings cards: 3 toggles, 1 AI-enabled, 1 key field, 1 duplicate window", () => {
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    expect(screen.getByText("Auto-fill job fields")).toBeInTheDocument();
    expect(screen.getByText("Auto-summary")).toBeInTheDocument();
    expect(screen.getByText("Auto-match")).toBeInTheDocument();
    expect(screen.getByText("AI-enabled")).toBeInTheDocument();
    expect(screen.getByText("OpenAI API key")).toBeInTheDocument();
    expect(screen.getByText("Duplicate detection window")).toBeInTheDocument();
  });

  it("disables key input while saving", async () => {
    let resolveKey: (() => void) | undefined;
    saveOpenAiKeyMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveKey = resolve;
      }),
    );
    settingsQueryMock.mockReturnValue(mockSettings());
    render(<SettingsTabPage />);

    const keyInput = screen.getByPlaceholderText("sk-...");
    fireEvent.change(keyInput, { target: { value: "sk-test-key" } });

    const saveButtons = screen.getAllByRole("button", { name: "Save" });
    const saveButton = saveButtons[0]!;
    fireEvent.click(saveButton);

    expect(keyInput).toBeDisabled();
    expect(saveButton).toBeDisabled();

    await act(async () => {
      resolveKey?.();
      await Promise.resolve();
    });

    expect(keyInput).not.toBeDisabled();
    expect(saveButton).toBeDisabled();
  });
});
