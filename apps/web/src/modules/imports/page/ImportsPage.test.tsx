import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ImportsPage from "./ImportsPage";

const useImportersListViewModelMock = vi.fn();
const useImportTemplatesForImporterQueryMock = vi.fn();

vi.mock("@/gql/hooks", async () => {
  const actual =
    await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return {
    ...actual,
    useImportTemplatesForImporterQuery: (...args: unknown[]) =>
      useImportTemplatesForImporterQueryMock(...args),
    useImportersForNewImportTemplatePickerQuery: () => ({
      loading: false,
      error: undefined,
      data: { __typename: "Query", importers: [] },
      refetch: vi.fn(),
    }),
    useCreateImportTemplateMutation: () => [vi.fn(), {}] as const,
    useUpdateImportTemplateMutation: () => [vi.fn(), {}] as const,
    useDeleteImportTemplateMutation: () => [vi.fn(), {}] as const,
  };
});

vi.mock("@/modules/imports/hooks/useImportersListViewModel", () => ({
  useImportersListViewModel: () => useImportersListViewModelMock(),
}));

function defaultViewModel() {
  return {
    importers: [{ importerId: "linkedin", name: "LinkedIn" }],
    searchQuery: "",
    setSearchQuery: vi.fn(),
    error: undefined,
    showInitialLoading: false,
  };
}

describe("ImportsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useImportTemplatesForImporterQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: {
        __typename: "Query",
        importTemplatesForImporter: [
          {
            __typename: "ImportTemplateType" as const,
            id: "template-uuid-1",
            importerId: "linkedin",
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

  it("lists importers from the view model", () => {
    useImportersListViewModelMock.mockReturnValue(defaultViewModel());

    render(<ImportsPage />);

    expect(screen.getByLabelText(/search importers/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /new import template/i }),
    ).toBeEnabled();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("linkedin")).toBeInTheDocument();
  });

  it("delegates search input to setSearchQuery", async () => {
    const setSearchQuery = vi.fn();
    useImportersListViewModelMock.mockReturnValue({
      ...defaultViewModel(),
      searchQuery: "",
      setSearchQuery,
    });

    render(<ImportsPage />);
    await userEvent.type(screen.getByLabelText(/search importers/i), "li");

    expect(setSearchQuery).toHaveBeenCalled();
  });

  it("opens SideDetails listing import templates when an importer row is activated", async () => {
    useImportersListViewModelMock.mockReturnValue(defaultViewModel());

    render(<ImportsPage />);

    await userEvent.click(screen.getByRole("button", { name: /^LinkedIn$/ }));

    expect(
      screen.getByRole("complementary", { name: /templates · LinkedIn/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Template 1$/)).toBeInTheDocument();
    expect(screen.getByText(/^Schedule off$/)).toBeInTheDocument();
  });

  it("shows empty state when API returns no importers with a template", () => {
    useImportersListViewModelMock.mockReturnValue({
      ...defaultViewModel(),
      importers: [],
    });

    render(<ImportsPage />);

    expect(
      screen.getByText(/no importers with a template yet/i),
    ).toBeInTheDocument();
  });
});
