import { ApplicationStage, type JobsQuery } from "@/gql/hooks";
import { toSyntheticJob, type WelcomeTourJobDraft } from "@/modules/welcome-tour/welcomeTourJobDraft";

export type WelcomeTourJobListItem = JobsQuery["jobs"][number];

const WELCOME_TOUR_SAMPLE_ACTIVE_JOBS = [
  {
    __typename: "JobType",
    id: "welcome-tour-sample-job-technical",
    title: "Senior Frontend Engineer",
    companyId: "welcome-tour-sample-company-northstar",
    description: "Build thoughtful, accessible product experiences with a collaborative engineering team.",
    urls: [],
    source: null,
    tags: ["React", "TypeScript"],
    location: "Remote",
    workRegion: "Worldwide",
    sourceRunId: null,
    summary: null,
    currentStage: ApplicationStage.Technical,
    currentStageReason: null,
    currentStageAt: "2026-08-10T14:00:00.000Z",
    createdAt: "2026-08-06T14:00:00.000Z",
    company: {
      __typename: "CompanyType",
      id: "welcome-tour-sample-company-northstar",
      name: "Northstar",
      description: null,
    },
    summaryMetadata: null,
    fillMetadata: null,
    match: null,
    salary: null,
  },
  {
    __typename: "JobType",
    id: "welcome-tour-sample-job-screen",
    title: "Product Engineer",
    companyId: "welcome-tour-sample-company-orbit",
    description: "Help a growing team bring new customer workflows from idea to production.",
    urls: [],
    source: null,
    tags: ["Product", "JavaScript"],
    location: "São Paulo",
    workRegion: "Brazil",
    sourceRunId: null,
    summary: null,
    currentStage: ApplicationStage.RecruiterScreen,
    currentStageReason: null,
    currentStageAt: "2026-08-09T14:00:00.000Z",
    createdAt: "2026-08-05T14:00:00.000Z",
    company: {
      __typename: "CompanyType",
      id: "welcome-tour-sample-company-orbit",
      name: "Orbit Labs",
      description: null,
    },
    summaryMetadata: null,
    fillMetadata: null,
    match: null,
    salary: null,
  },
  {
    __typename: "JobType",
    id: "welcome-tour-sample-job-culture",
    title: "Full-stack Engineer",
    companyId: "welcome-tour-sample-company-figment",
    description: "Create reliable tools that make complex work simpler for teams around the world.",
    urls: [],
    source: null,
    tags: ["Node.js", "PostgreSQL"],
    location: "Remote",
    workRegion: "Americas",
    sourceRunId: null,
    summary: null,
    currentStage: ApplicationStage.CulturalFit,
    currentStageReason: null,
    currentStageAt: "2026-08-08T14:00:00.000Z",
    createdAt: "2026-08-04T14:00:00.000Z",
    company: {
      __typename: "CompanyType",
      id: "welcome-tour-sample-company-figment",
      name: "Figment",
      description: null,
    },
    summaryMetadata: null,
    fillMetadata: null,
    match: null,
    salary: null,
  },
] satisfies Array<WelcomeTourJobListItem>;

/**
 * Returns the Active-filter examples used only by the final welcome-tour list segment.
 */
export function getWelcomeTourActiveJobs(draft: WelcomeTourJobDraft): Array<WelcomeTourJobListItem> {
  return [toSyntheticJob(draft), ...WELCOME_TOUR_SAMPLE_ACTIVE_JOBS];
}
