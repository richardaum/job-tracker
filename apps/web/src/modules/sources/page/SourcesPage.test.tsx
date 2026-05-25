import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SourcesPage from "./SourcesPage";

const useSourcesListViewModelMock = vi.fn();
const useSourcesForSourceProfileQueryMock = vi.fn();

vi.mock("@/gql/hooks", async () => {
  const actual =
    await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return {
    ...actual,
    useSourcesForSourceProfileQuery: (...args: unknown[]) =>
      useSourcesForSourceProfileQueryMock(...args),
    useSourceProfilesForNewSourcePickerQuery: () => ({
      loading: false,
      error: undefined,
      data: { __typename: "Query", sourceProfiles: [] },
      refetch: vi.fn(),
    }),
    useCreateSourceTemplateMutation: () => [vi.fn(), {}] as const,
    useUpdateSourceTemplateMutation: () => [vi.fn(), {}] as const,
    useDeleteSourceTemplateMutation: () => [vi.fn(), {}] as const,
    useRerunSourceTemplateMutation: () => [vi.fn(), {}] as const,
  };
});

vi.mock("@/modules/sources/hooks/useSourcesListViewModel", () => ({
  useSourcesListViewModel: () => useSourcesListViewModelMock(),
}));

function defaultViewModel() {
  return {
    sourceProfiles: [{ sourceProfileId: "linkedin", name: "LinkedIn" }],
    searchQuery: "",
    setSearchQuery: vi.fn(),
    error: undefined,
    showInitialLoading: false,
  };
}

describe("SourcesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSourcesForSourceProfileQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: {
        __typename: "Query",
        sourceTemplatesForSourceProfile: [
          {
            __typename: "SourceTemplateType" as const,
            id: "source-uuid-1",
            sourceProfileId: "linkedin",
            scheduleCron: null,
            scheduleEnabled: false,
            surfaceUrl: "https://example.com/surface",
            createdAt: "2026-03-01T12:00:00.000Z",
            runs: [],
          },
        ],
      },
    });
  });

  it("lists source profiles from the view model", () => {
    useSourcesListViewModelMock.mockReturnValue(defaultViewModel());

    render(<SourcesPage />);

    expect(screen.getByLabelText(/search sources/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new source/i })).toBeEnabled();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("linkedin")).toBeInTheDocument();
  });

  it("delegates search input to setSearchQuery", async () => {
    const setSearchQuery = vi.fn();
    useSourcesListViewModelMock.mockReturnValue({
      ...defaultViewModel(),
      searchQuery: "",
      setSearchQuery,
    });

    render(<SourcesPage />);
    await userEvent.type(screen.getByLabelText(/search sources/i), "li");

    expect(setSearchQuery).toHaveBeenCalled();
  });

  it("opens SideDetails listing sources when a source profile row is activated", async () => {
    useSourcesListViewModelMock.mockReturnValue(defaultViewModel());

    render(<SourcesPage />);

    await userEvent.click(screen.getByRole("button", { name: /^LinkedIn$/ }));

    expect(
      screen.getByRole("complementary", { name: /sources · linkedin/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Source 1$/)).toBeInTheDocument();
    expect(screen.getByText(/^Schedule off$/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /run source 1/i }),
    ).toBeInTheDocument();
  });

  it("shows empty state when API returns no source profiles with sources", () => {
    useSourcesListViewModelMock.mockReturnValue({
      ...defaultViewModel(),
      sourceProfiles: [],
    });

    render(<SourcesPage />);

    expect(
      screen.getByText(/no source profiles with sources yet/i),
    ).toBeInTheDocument();
  });
});
