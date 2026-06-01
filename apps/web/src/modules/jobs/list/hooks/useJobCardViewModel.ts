"use client";

import { tipTapToPlainText } from "@job-tracker/tiptap";
import { useState } from "react";

import type { JobsQuery, JobStageEventsQuery } from "@/gql/hooks";
import { useJobStageEventsQuery } from "@/gql/hooks";
import { formatSalary, hasSalaryOnCard } from "@/modules/jobs/shared/utils/salaryFormat";

export type JobCardJob = JobsQuery["jobs"][number];

export type JobCardStageEventRow = NonNullable<JobStageEventsQuery["jobStageEvents"]>[number];

export function useJobCardViewModel(job: JobCardJob) {
  const [stageEventsRequested, setStageEventsRequested] = useState(false);
  const { data: stageEventsData, loading: stageEventsLoading } = useJobStageEventsQuery({
    variables: { jobId: job.id },
    skip: !stageEventsRequested,
    fetchPolicy: "cache-first",
  });
  const jobStageEvents: Array<JobCardStageEventRow> = stageEventsData?.jobStageEvents ?? [];

  function requestStageEvents() {
    setStageEventsRequested(true);
  }

  const descriptionPreview = tipTapToPlainText(job.description);
  const formattedSalary = formatSalary(job.salary);
  const tags = job.tags ?? [];
  const showSalary = hasSalaryOnCard({ line: formattedSalary, tags });
  const salaryActionLabel = formattedSalary ? "Edit salary" : "Add salary";

  return {
    jobStageEvents,
    stageEventsLoading,
    stageEventsRequested,
    requestStageEvents,
    descriptionPreview,
    salary: job.salary,
    formattedSalary,
    tags,
    showSalary,
    salaryActionLabel,
  };
}
