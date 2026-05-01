"use client";

import React from "react";

import type {
  ApplicationSource,
  ApplicationStage,
  ApplicationStageEventsQuery,
  SalaryPeriod,
} from "@/gql/hooks";
import { useApplicationStageEventsQuery } from "@/gql/hooks";
import {
  formatCompensationLine,
  hasCompensationOnCard,
} from "@/modules/applications/shared/utils/compensationFormat";
import { tipTapToPlainText } from "@/modules/applications/shared/utils/tiptap";

export interface ApplicationCardApplication {
  id: string;
  title: string;
  companyId: string;
  company: { id: string; name: string; description?: string | null };
  description?: string | null;
  url?: string | null;
  source?: ApplicationSource | null;
  salaryMinCents?: number | null;
  salaryMaxCents?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: SalaryPeriod | null;
  tags: Array<string>;
  currentStage: ApplicationStage;
  currentStageReason?: string | null;
  currentStageAt: string;
  createdAt: string;
}

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
  const compLine = formatCompensationLine({
    salaryMinCents: application.salaryMinCents,
    salaryMaxCents: application.salaryMaxCents,
    salaryCurrency: application.salaryCurrency,
    salaryPeriod: application.salaryPeriod,
  });
  const compTags = application.tags ?? [];
  const showComp = hasCompensationOnCard({ line: compLine, tags: compTags });
  const compensationActionLabel = compLine
    ? `Edit compensation for ${application.title}`
    : `Add compensation for ${application.title}`;
  const compensationActionTooltip = compLine
    ? "Edit compensation"
    : "Add salary";

  return {
    applicationStageEvents,
    stageEventsLoading,
    stageEventsRequested,
    requestStageEvents,
    descriptionPreview,
    compLine,
    compTags,
    showComp,
    compensationActionLabel,
    compensationActionTooltip,
  };
}
