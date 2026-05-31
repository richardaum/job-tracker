import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MatchWizardDialog } from "./MatchWizardDialog";

const gqlMocks = vi.hoisted(() => ({
  useResumesForPickerQuery: vi.fn(),
  useWorkPreferencesQuery: vi.fn(),
  useUpdateWorkPreferencesMutation: vi.fn(),
}));

vi.mock("@/modules/jobs/shared/hooks/useToastQueue", () => ({
  useToastQueue: () => ({ enqueueToast: vi.fn() }),
}));

vi.mock("@/gql/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/gql/hooks")>();
  return {
    ...actual,
    useResumesForPickerQuery: gqlMocks.useResumesForPickerQuery,
    useWorkPreferencesQuery: gqlMocks.useWorkPreferencesQuery,
    useUpdateWorkPreferencesMutation: gqlMocks.useUpdateWorkPreferencesMutation,
  };
});

function setupMocks() {
  gqlMocks.useResumesForPickerQuery.mockReturnValue({
    data: {
      resumes: [
        { id: "resume-a", title: "Default resume", isDefault: true },
        { id: "resume-b", title: "Backend resume", isDefault: false },
      ],
    },
    loading: false,
    refetch: vi.fn(),
  });
  gqlMocks.useWorkPreferencesQuery.mockReturnValue({
    data: { workPreferences: [] },
    loading: false,
  });
  gqlMocks.useUpdateWorkPreferencesMutation.mockReturnValue([vi.fn().mockResolvedValue({})]);
}

describe("MatchWizardDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it("shows loading state when resumes are not ready yet", () => {
    gqlMocks.useResumesForPickerQuery.mockReturnValue({
      data: undefined,
      loading: true,
      refetch: vi.fn(),
    });

    render(
      <MatchWizardDialog
        open
        onOpenChange={vi.fn()}
        onGenerate={vi.fn().mockResolvedValue(undefined)}
        generating={false}
        hasExistingMatch={false}
      />,
    );

    expect(screen.getByText(/loading resumes/i)).toBeInTheDocument();
  });

  it("preselects initialResumeId in the resume select when regenerating", async () => {
    render(
      <MatchWizardDialog
        open
        onOpenChange={vi.fn()}
        onGenerate={vi.fn().mockResolvedValue(undefined)}
        generating={false}
        hasExistingMatch
        initialResumeId="resume-b"
      />,
    );

    expect(await screen.findByRole("combobox", { name: /select a resume/i })).toHaveTextContent(
      "Backend resume",
    );
  });
});
