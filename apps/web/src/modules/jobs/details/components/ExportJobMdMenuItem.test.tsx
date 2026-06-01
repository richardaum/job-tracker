import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { Button, DropdownMenu } from "@job-tracker/ui";

import { ApplicationStage, FitClassification, JobSource, SalaryPeriod } from "@/gql/hooks";

import { ExportJobMdMenuItem, type ExportJobMdMenuItemProps } from "./ExportJobMdMenuItem";

const mocks = vi.hoisted(() => ({
  formatJobAsMarkdown: vi.fn().mockReturnValue("# Mock markdown"),
  downloadMarkdown: vi.fn(),
  slugifyFileName: vi.fn().mockReturnValue("job-title.md"),
  enqueueToast: vi.fn(),
  useJobNotesLazyQuery: vi.fn(),
  useJobStageEventsLazyQuery: vi.fn(),
}));

vi.mock("../utils/export-job-md", () => ({
  formatJobAsMarkdown: mocks.formatJobAsMarkdown,
  downloadMarkdown: mocks.downloadMarkdown,
  slugifyFileName: mocks.slugifyFileName,
}));

vi.mock("@/modules/jobs/shared/hooks/useToastQueue", () => ({
  useToastQueue: () => ({ enqueueToast: mocks.enqueueToast }),
}));

vi.mock("@/gql/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/gql/hooks")>();
  return {
    ...actual,
    useJobNotesLazyQuery: mocks.useJobNotesLazyQuery,
    useJobStageEventsLazyQuery: mocks.useJobStageEventsLazyQuery,
  };
});

const mockJob: ExportJobMdMenuItemProps["job"] = {
  id: "job-1",
  title: "Software Engineer",
  company: { id: "company-1", name: "Acme Inc", description: null },
  description: "A great job description",
  urls: ["https://example.com"],
  source: JobSource.Linkedin,
  tags: ["React", "TypeScript"],
  location: "Remote",
  workRegion: "Americas",
  summary: "Awesome role summary",
  htmlContent: null,
  currentStage: ApplicationStage.Applied,
  currentStageAt: "2024-01-15T10:00:00.000Z",
  createdAt: "2024-01-10T08:00:00.000Z",
  salary: { minCents: 10000000, maxCents: 15000000, currency: "USD", period: SalaryPeriod.Year },
  match: {
    id: "match-1",
    resumeId: "resume-1",
    scoreRatio: 85,
    classification: FitClassification.Positive,
    matchCount: 10,
    gapCount: 2,
    unclearCount: 1,
  },
};

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu open={true} onOpenChange={() => {}} trigger={<Button type="button">Actions</Button>}>
      {children}
    </DropdownMenu>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ExportJobMdMenuItem", () => {
  it("renders a DropdownMenuItem with 'Export as Markdown' label", () => {
    mocks.useJobNotesLazyQuery.mockReturnValue([vi.fn(), {}]);
    mocks.useJobStageEventsLazyQuery.mockReturnValue([vi.fn(), {}]);

    render(<ExportJobMdMenuItem jobId="job-1" job={mockJob} />, { wrapper: Wrapper });

    expect(screen.getByRole("menuitem", { name: /Export as Markdown/i })).toBeInTheDocument();
  });

  it("triggers lazy queries and shows loading state on click", async () => {
    const user = userEvent.setup();
    const fetchNotes = vi.fn().mockReturnValue(new Promise<never>(() => {}));
    const fetchEvents = vi.fn().mockReturnValue(new Promise<never>(() => {}));

    mocks.useJobNotesLazyQuery.mockReturnValue([fetchNotes, {}]);
    mocks.useJobStageEventsLazyQuery.mockReturnValue([fetchEvents, {}]);

    render(<ExportJobMdMenuItem jobId="job-1" job={mockJob} />, { wrapper: Wrapper });

    await user.click(screen.getByRole("menuitem", { name: /Export as Markdown/i }));

    expect(screen.getByText("Exporting...")).toBeInTheDocument();
    expect(fetchNotes).toHaveBeenCalledWith({ variables: { jobId: "job-1" } });
    expect(fetchEvents).toHaveBeenCalledWith({ variables: { jobId: "job-1" } });
  });

  it("calls downloadMarkdown with correct args on query success", async () => {
    const user = userEvent.setup();
    const fetchNotes = vi.fn().mockResolvedValue({ data: { jobNotes: [] } });
    const fetchEvents = vi.fn().mockResolvedValue({ data: { jobStageEvents: [] } });

    mocks.useJobNotesLazyQuery.mockReturnValue([fetchNotes, {}]);
    mocks.useJobStageEventsLazyQuery.mockReturnValue([fetchEvents, {}]);

    render(<ExportJobMdMenuItem jobId="job-1" job={mockJob} />, { wrapper: Wrapper });

    await user.click(screen.getByRole("menuitem", { name: /Export as Markdown/i }));

    await waitFor(() => {
      expect(mocks.downloadMarkdown).toHaveBeenCalledWith("# Mock markdown", "job-title.md");
    });

    expect(mocks.slugifyFileName).toHaveBeenCalledWith("Software Engineer", "Acme Inc", "job-1");
    expect(mocks.formatJobAsMarkdown).toHaveBeenCalledTimes(1);
  });

  it("shows error toast and resets loading on fetch failure", async () => {
    const user = userEvent.setup();
    const fetchNotes = vi.fn().mockRejectedValue(new Error("Network error"));
    const fetchEvents = vi.fn().mockResolvedValue({ data: { jobStageEvents: [] } });

    mocks.useJobNotesLazyQuery.mockReturnValue([fetchNotes, {}]);
    mocks.useJobStageEventsLazyQuery.mockReturnValue([fetchEvents, {}]);

    render(<ExportJobMdMenuItem jobId="job-1" job={mockJob} />, { wrapper: Wrapper });

    await user.click(screen.getByRole("menuitem", { name: /Export as Markdown/i }));

    await waitFor(() => {
      expect(mocks.enqueueToast).toHaveBeenCalledWith({ title: "Failed to export job as Markdown", intent: "error" });
    });

    expect(screen.getByRole("menuitem", { name: /Export as Markdown/i })).toBeInTheDocument();
  });
});
