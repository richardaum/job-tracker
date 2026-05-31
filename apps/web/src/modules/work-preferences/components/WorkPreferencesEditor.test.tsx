import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Weight } from "@/gql/hooks";

import WorkPreferencesEditor from "./WorkPreferencesEditor";

const workPreferencesQueryMock = vi.fn();
const updatePreferencesMock = vi.fn();
const enqueueToastMock = vi.fn();

vi.mock("@/gql/hooks", async () => {
  const actual = await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return {
    ...actual,
    useWorkPreferencesQuery: () => workPreferencesQueryMock(),
    useUpdateWorkPreferencesMutation: () => [updatePreferencesMock],
  };
});

vi.mock("@/modules/jobs/shared/hooks/useToastQueue", () => ({
  useToastQueue: () => ({ enqueueToast: enqueueToastMock }),
}));

function mockWithItems() {
  return {
    loading: false,
    data: {
      workPreferences: [
        { text: "Remote", weight: Weight.High },
        { text: "Equity", weight: Weight.Low },
      ],
    },
  };
}

function mockEmpty() {
  return { loading: false, data: { workPreferences: [] } };
}

function mockLoading() {
  return { loading: true, data: undefined };
}

describe("WorkPreferencesEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updatePreferencesMock.mockResolvedValue({});
  });

  it("inline mode: renders form directly (no Dialog shell)", () => {
    workPreferencesQueryMock.mockReturnValue(mockEmpty());
    render(<WorkPreferencesEditor mode="inline" />);

    expect(
      screen.getByText(
        "What matters to you in a job? These preferences are used to evaluate match against job descriptions.",
      ),
    ).toBeInTheDocument();
  });

  it("inline mode: renders preference cards and add button", () => {
    workPreferencesQueryMock.mockReturnValue(mockWithItems());
    render(<WorkPreferencesEditor mode="inline" />);

    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getByText("Equity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add preference/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save changes/i })).not.toBeInTheDocument();
  });

  it("dialog mode: renders content without duplicated page title text", () => {
    workPreferencesQueryMock.mockReturnValue(mockEmpty());
    render(<WorkPreferencesEditor mode="dialog" />);

    expect(screen.queryByText("Work Preferences")).not.toBeInTheDocument();
  });

  it("dialog mode: shows Cancel button instead of Save", () => {
    workPreferencesQueryMock.mockReturnValue(mockWithItems());
    render(<WorkPreferencesEditor mode="dialog" />);

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^save$/i })).not.toBeInTheDocument();
  });

  it("add item: opens form dialog and persists on submit", async () => {
    const user = userEvent.setup();
    workPreferencesQueryMock.mockReturnValue(mockEmpty());
    render(<WorkPreferencesEditor mode="inline" />);

    expect(screen.getByText(/no preferences yet/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add preference/i }));
    expect(screen.getByRole("dialog", { name: /add preference/i })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("e.g. Remote-first company"), "Remote-first");
    await user.click(screen.getByRole("button", { name: /^add$/i }));

    expect(updatePreferencesMock).toHaveBeenCalledWith({
      variables: { items: [{ text: "Remote-first", weight: Weight.Low }] },
      refetchQueries: ["WorkPreferences"],
    });
    expect(screen.getByText("Remote-first")).toBeInTheDocument();
  });

  it("edit item: opens form dialog and persists on save", async () => {
    const user = userEvent.setup();
    workPreferencesQueryMock.mockReturnValue(mockWithItems());
    render(<WorkPreferencesEditor mode="inline" />);

    await user.click(screen.getByRole("button", { name: /edit preference "remote"/i }));
    expect(screen.getByRole("dialog", { name: /edit preference/i })).toBeInTheDocument();

    const input = screen.getByPlaceholderText("e.g. Remote-first company");
    await user.clear(input);
    await user.type(input, "Remote-first");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(updatePreferencesMock).toHaveBeenCalledWith({
      variables: {
        items: [
          { text: "Remote-first", weight: Weight.High },
          { text: "Equity", weight: Weight.Low },
        ],
      },
      refetchQueries: ["WorkPreferences"],
    });
  });

  it("remove item: confirms delete and persists", async () => {
    const user = userEvent.setup();
    workPreferencesQueryMock.mockReturnValue(mockWithItems());
    render(<WorkPreferencesEditor mode="inline" />);

    await user.click(screen.getByRole("button", { name: /delete preference "remote"/i }));
    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(screen.queryByText("Remote")).not.toBeInTheDocument();
    expect(updatePreferencesMock).toHaveBeenCalledWith({
      variables: { items: [{ text: "Equity", weight: Weight.Low }] },
      refetchQueries: ["WorkPreferences"],
    });
  });

  it("weight change via dropdown persists immediately", async () => {
    const user = userEvent.setup();
    workPreferencesQueryMock.mockReturnValue(mockWithItems());
    render(<WorkPreferencesEditor mode="inline" />);

    await user.click(screen.getByRole("button", { name: /weight: high/i }));
    await user.click(screen.getByRole("menuitem", { name: /low/i }));

    expect(updatePreferencesMock).toHaveBeenCalledWith({
      variables: {
        items: [
          { text: "Remote", weight: Weight.Low },
          { text: "Equity", weight: Weight.Low },
        ],
      },
      refetchQueries: ["WorkPreferences"],
    });
  });

  it("readOnly: no add/edit/delete actions", () => {
    workPreferencesQueryMock.mockReturnValue(mockWithItems());
    render(<WorkPreferencesEditor mode="inline" readOnly />);

    expect(screen.queryByRole("button", { name: /add preference/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /edit preference/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /delete preference/i })).toBeNull();

    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getByText("Equity")).toBeInTheDocument();
  });

  it("loading state", () => {
    workPreferencesQueryMock.mockReturnValue(mockLoading());
    render(<WorkPreferencesEditor mode="inline" />);
    expect(screen.getByText("Loading preferences...")).toBeInTheDocument();
  });

  it("empty state", () => {
    workPreferencesQueryMock.mockReturnValue(mockEmpty());
    render(<WorkPreferencesEditor mode="inline" />);
    expect(screen.getByText(/no preferences yet/i)).toBeInTheDocument();
  });
});
