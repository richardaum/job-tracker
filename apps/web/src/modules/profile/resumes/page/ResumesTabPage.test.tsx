import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileHeaderActionsContext } from "@/modules/profile/layout/hooks/useProfileHeaderActions";

import ResumesTabPage from "./ResumesTabPage";

const useResumesQueryMock = vi.fn();
const deleteResumeMock = vi.fn();
const updateResumeMock = vi.fn();
const enqueueToastMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock("@/gql/hooks", async () => {
  const actual =
    await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return {
    ...actual,
    useResumesQuery: () => useResumesQueryMock(),
    useDeleteResumeMutation: () => [deleteResumeMock],
    useUpdateResumeMutation: () => [updateResumeMock],
    useCreateResumeMutation: () => [vi.fn()],
    DeleteResumeDocument: {},
    ResumesDocument: {},
  };
});

vi.mock("@/modules/jobs/shared/utils/apolloDeleteCache", () => ({
  removeDeletedEntityFromListCache: vi.fn(),
}));

vi.mock("@/modules/jobs/shared/hooks/useToastQueue", () => ({
  useToastQueue: () => ({ enqueueToast: enqueueToastMock }),
}));

function HeaderContextWrapper({ children }: { children: React.ReactNode }) {
  const [actions, setActions] = useState<React.ReactNode | null>(null);
  return (
    <ProfileHeaderActionsContext.Provider value={setActions}>
      <div>{actions}</div>
      {children}
    </ProfileHeaderActionsContext.Provider>
  );
}

function mockResumes() {
  return {
    loading: false,
    data: {
      resumes: [
        {
          id: "res-1",
          title: "Software Engineer",
          content: '{"type":"doc","content":[]}',
          isDefault: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    },
    error: undefined,
  };
}

function mockEmpty() {
  return { loading: false, data: { resumes: [] }, error: undefined };
}

function mockLoading() {
  return { loading: true, data: undefined, error: undefined };
}

describe("ResumesTabPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Add resume button via header portal", () => {
    useResumesQueryMock.mockReturnValue(mockResumes());
    render(
      <HeaderContextWrapper>
        <ResumesTabPage />
      </HeaderContextWrapper>,
    );
    expect(
      screen.getByRole("button", { name: /add resume/i }),
    ).toBeInTheDocument();
  });

  it("clicking Add resume opens dialog", async () => {
    const user = userEvent.setup();
    useResumesQueryMock.mockReturnValue(mockEmpty());
    render(
      <HeaderContextWrapper>
        <ResumesTabPage />
      </HeaderContextWrapper>,
    );

    await user.click(screen.getByRole("button", { name: /add resume/i }));
    expect(screen.getByText("Add Resume")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e.g. Senior Software Engineer/i),
    ).toBeInTheDocument();
  });

  it("shows empty state when no resumes", () => {
    useResumesQueryMock.mockReturnValue(mockEmpty());
    render(
      <HeaderContextWrapper>
        <ResumesTabPage />
      </HeaderContextWrapper>,
    );
    expect(screen.getByText("No resumes yet.")).toBeInTheDocument();
  });

  it("shows cards when resumes exist", () => {
    useResumesQueryMock.mockReturnValue(mockResumes());
    render(
      <HeaderContextWrapper>
        <ResumesTabPage />
      </HeaderContextWrapper>,
    );
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("shows loading skeleton on initial load", () => {
    useResumesQueryMock.mockReturnValue(mockLoading());
    render(
      <HeaderContextWrapper>
        <ResumesTabPage />
      </HeaderContextWrapper>,
    );
    expect(screen.queryByText("No resumes yet.")).not.toBeInTheDocument();
    expect(screen.queryByText("Software Engineer")).not.toBeInTheDocument();
  });
});
