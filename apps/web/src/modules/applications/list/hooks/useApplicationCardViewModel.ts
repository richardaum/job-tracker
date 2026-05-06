"use client";

import React from "react";

import type {
  ApplicationsQuery,
  ApplicationStageEventsQuery,
} from "@/gql/hooks";
import { useApplicationStageEventsQuery } from "@/gql/hooks";
import {
  formatSalary,
  hasSalaryOnCard,
} from "@/modules/applications/shared/utils/salaryFormat";
import { tipTapToPlainText } from "@/modules/applications/shared/utils/tiptap";

export type ApplicationCardApplication =
  ApplicationsQuery["applications"][number];

export type ApplicationCardStageEventRow = NonNullable<
  ApplicationStageEventsQuery["applicationStageEvents"]
>[number];

export function useApplicationCardViewModel(
  application: ApplicationCardApplication,
) {
  const [stageEventsRequested, setStageEventsRequested] = React.useState(false);
  const { data: stageEventsData, loading: stageEventsLoading } =
    useApplicationStageEventsQuery({
      variables: { applicationId: application.id },
      skip: !stageEventsRequested,
      fetchPolicy: "cache-first",
    });
  const applicationStageEvents: Array<ApplicationCardStageEventRow> =
    stageEventsData?.applicationStageEvents ?? [];

  function requestStageEvents() {
    setStageEventsRequested(true);
  }

  const descriptionPreview = tipTapToPlainText(application.description);
  const formattedSalary = formatSalary(application.salary);
  const tags = application.tags ?? [];
  const showSalary = hasSalaryOnCard({ line: formattedSalary, tags });
  const salaryActionLabel = formattedSalary ? "Edit salary" : "Add salary";

  return {
    applicationStageEvents,
    stageEventsLoading,
    stageEventsRequested,
    requestStageEvents,
    descriptionPreview,
    salary: application.salary,
    formattedSalary,
    tags,
    showSalary,
    salaryActionLabel,
  };
}
