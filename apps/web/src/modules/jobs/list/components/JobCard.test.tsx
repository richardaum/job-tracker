import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationStage } from "@/gql/hooks";
import { JOB_DETAIL_TITLE_PLACEHOLDER } from "@/modules/jobs/details/utils/job-detail-title";
import type { JobCardJob } from "@/modules/jobs/list/hooks/useJobCardViewModel";

import { JobCard } from "./JobCard";

const useJobStageEventsQueryMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn() }) }));

vi.mock("next/image", () => ({
  default: (props: { alt?: string }) => <span data-testid="mock-image" aria-label={props.alt ?? ""} />,
}));

vi.mock("@/gql/hooks", () => ({
  ApplicationStage: {
    New: "NEW",
    Duplicated: "DUPLICATED",
    Applied: "APPLIED",
    RecruiterScreen: "RECRUITER_SCREEN",
    Technical: "TECHNICAL",
    CulturalFit: "CULTURAL_FIT",
    Offer: "OFFER",
    Rejected: "REJECTED",
    Draft: "DRAFT",
  },
  SalaryPeriod: { Year: "YEAR", Month: "MONTH", Hour: "HOUR" },
  JobSource: { Jack: "JACK", Linkedin: "LINKEDIN", RemoteYeah: "REMOTE_YEAH", Wellfound: "WELLFOUND" },
  useJobStageEventsQuery: (options?: { skip?: boolean }) => useJobStageEventsQueryMock(options),
}));

vi.mock("./JobQuickEditDialog", () => ({ JobQuickEditDialog: () => null }));

vi.mock("./DeleteJobDialog", () => ({
  DeleteJobDialog: ({ trigger }: { trigger: ReactNode }) => <div>{trigger}</div>,
}));

vi.mock("@/modules/jobs/details/components/SalaryEditDialog", () => ({ SalaryEditDialog: () => null }));

vi.mock("./JobTrackingPanel", () => ({
  JobTrackingPanel: () => <div data-testid="tracking-panel">Tracking panel</div>,
}));

function createJobFixture(overrides: Partial<JobCardJob> = {}): JobCardJob {
  const base = {
    id: "job-1",
    title: "Software Engineer",
    companyId: "company-1",
    company: { id: "company-1", name: "Acme Corp", description: null },
    description: null,
    urls: [],
    source: null,
    tags: [],
    location: null,
    workRegion: null,
    sourceRunId: null,
    summary: null,
    summaryMetadata: null,
    fillMetadata: null,
    match: undefined,
    createdAt: "2026-04-20T00:00:00.000Z",
    currentStage: ApplicationStage.New,
    currentStageReason: null,
    currentStageAt: "2026-04-20T00:00:00.000Z",
    salary: { minCents: null, maxCents: null, currency: null, period: null },
    ...overrides,
  };

  const companyOverride = overrides.company;
  if (companyOverride) {
    base.company = { ...base.company, ...companyOverride };
  }

  return base as JobCardJob;
}

describe("JobCard", () => {
  beforeEach(() => {
    useJobStageEventsQueryMock.mockImplementation((options: { skip?: boolean } | undefined) => {
      if (options?.skip) {
        return { data: undefined, loading: false, error: undefined };
      }
      return { data: { jobStageEvents: [] }, loading: false, error: undefined };
    });
  });

  it("shows Draft status badge when currentStage is Draft", () => {
    render(
      <JobCard
        job={createJobFixture({ currentStage: ApplicationStage.Draft })}
        onSuccess={() => {}}
        onError={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /open status history for draft/i })).toBeInTheDocument();
  });

  it("does not advertise Draft stage when job is Applied", () => {
    render(
      <JobCard
        job={createJobFixture({ currentStage: ApplicationStage.Applied })}
        onSuccess={() => {}}
        onError={() => {}}
      />,
    );
    expect(screen.queryAllByText("Draft")).toHaveLength(0);
  });

  it("shows Untitled Draft when title is null", () => {
    render(
      <JobCard
        job={createJobFixture({ title: null, currentStage: ApplicationStage.New })}
        onSuccess={() => {}}
        onError={() => {}}
      />,
    );
    expect(screen.getByRole("link", { name: JOB_DETAIL_TITLE_PLACEHOLDER })).toBeInTheDocument();
  });

  it("shows actual title when title is present", () => {
    render(<JobCard job={createJobFixture({ title: "Product Designer" })} onSuccess={() => {}} onError={() => {}} />);
    expect(screen.getByRole("link", { name: "Product Designer" })).toBeInTheDocument();
  });

  it("shows company meta when company has a non-empty name", () => {
    render(<JobCard job={createJobFixture()} onSuccess={() => {}} onError={() => {}} />);
    expect(screen.getByTestId("job-card-company-meta")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("omits company from meta row when company name is empty", () => {
    render(
      <JobCard
        job={createJobFixture({ company: { id: "company-1", name: "", description: null } })}
        onSuccess={() => {}}
        onError={() => {}}
      />,
    );
    expect(screen.queryByTestId("job-card-company-meta")).not.toBeInTheDocument();
  });

  it("omits company from meta row when company name is whitespace only", () => {
    render(
      <JobCard
        job={createJobFixture({ company: { id: "company-1", name: "   ", description: null } })}
        onSuccess={() => {}}
        onError={() => {}}
      />,
    );
    expect(screen.queryByTestId("job-card-company-meta")).not.toBeInTheDocument();
  });
});
