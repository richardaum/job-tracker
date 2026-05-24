import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProfileHeaderSlotsTestWrapper } from "@/modules/profile/layout/test/profileHeaderSlotsTestWrapper";

import PreferencesTabPage from "./PreferencesTabPage";

const workPreferencesQueryMock = vi.fn();
const updatePreferencesMock = vi.fn();

vi.mock("@/gql/hooks", async () => {
  const actual =
    await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return {
    ...actual,
    useWorkPreferencesQuery: () => workPreferencesQueryMock(),
    useUpdateWorkPreferencesMutation: () => [updatePreferencesMock],
  };
});

vi.mock("@/modules/jobs/shared/hooks/useToastQueue", () => ({
  useToastQueue: () => ({ enqueueToast: vi.fn() }),
}));

describe("PreferencesTabPage", () => {
  it("renders WorkPreferencesEditor with mode=inline", () => {
    workPreferencesQueryMock.mockReturnValue({
      loading: false,
      data: { workPreferences: [] },
    });
    render(<PreferencesTabPage />, { wrapper: ProfileHeaderSlotsTestWrapper });

    expect(
      screen.getByText(
        "What matters to you in a job? These preferences are used to evaluate match against job descriptions.",
      ),
    ).toBeInTheDocument();
  });

  it("renders Add preference button via header portal", () => {
    workPreferencesQueryMock.mockReturnValue({
      loading: false,
      data: { workPreferences: [] },
    });
    render(<PreferencesTabPage />, { wrapper: ProfileHeaderSlotsTestWrapper });

    expect(
      screen.getByRole("button", { name: /add preference/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /save changes/i }),
    ).not.toBeInTheDocument();
  });

  it("clicking Add preference opens form dialog", async () => {
    const user = userEvent.setup();
    workPreferencesQueryMock.mockReturnValue({
      loading: false,
      data: { workPreferences: [] },
    });
    render(<PreferencesTabPage />, { wrapper: ProfileHeaderSlotsTestWrapper });

    await user.click(screen.getByRole("button", { name: /add preference/i }));

    expect(
      screen.getByRole("dialog", { name: /add preference/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("e.g. Remote-first company"),
    ).toBeInTheDocument();
  });

  it("does not render footer save or discard controls", () => {
    workPreferencesQueryMock.mockReturnValue({
      loading: false,
      data: { workPreferences: [] },
    });
    render(<PreferencesTabPage />, { wrapper: ProfileHeaderSlotsTestWrapper });

    expect(
      screen.queryByRole("button", { name: /save changes/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /discard/i }),
    ).not.toBeInTheDocument();
  });
});
