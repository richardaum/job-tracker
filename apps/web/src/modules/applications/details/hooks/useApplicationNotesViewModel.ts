"use client";

import { useApplicationQuery } from "@/gql/hooks";
import { deriveDetailStatus } from "@/lib/entity-detail-view-status";
import { type ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";

export function useApplicationNotesViewModel(applicationId: string) {
  const { data, error, loading } = useApplicationQuery({
    variables: { id: applicationId },
    fetchPolicy: "cache-and-network",
  });

  const application = data?.application as ApplicationDetailsValues | undefined;
  const status = deriveDetailStatus(loading, error);

  const hasApplication = application != null;
  const shouldGoBackToTheApplicationsList = status === "error";
  const shouldGoBackToApplication =
    hasApplication && (status === "success" || status === "error");

  return {
    application,
    status,
    shouldGoBackToApplication,
    shouldGoBackToTheApplicationsList,
  };
}
