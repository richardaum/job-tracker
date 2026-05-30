"use client";

import {
  useSourceRunEventsSubscription,
  useSourceTemplateQuery,
} from "@/gql/hooks";
import { deriveDetailStatus } from "@/lib/entity-detail-view-status";

export function useSourceRunsViewModel(templateId: string) {
  const { data, loading, error, refetch } = useSourceTemplateQuery({
    variables: { id: templateId },
    fetchPolicy: "cache-and-network",
  });

  useSourceRunEventsSubscription({
    onData: ({ data }) => {
      if (data.data?.sourceRunEvents.run.templateId === templateId) {
        void refetch();
      }
    },
  });

  const template = data?.sourceTemplate ?? null;
  const status = deriveDetailStatus(loading, error);

  return {
    template,
    error,
    status,
    notFound: status === "notFound",
    showInitialLoading: loading && !data,
  };
}
