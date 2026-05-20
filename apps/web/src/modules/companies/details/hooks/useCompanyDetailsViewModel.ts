"use client";

import {
  type ApplicationsQuery,
  useApplicationsQuery,
  useCompanyQuery,
} from "@/gql/hooks";
import { deriveDetailStatus } from "@/lib/entity-detail-view-status";

export function useCompanyDetailsViewModel(companyId: string) {
  const { data, loading, error } = useCompanyQuery({
    variables: { id: companyId },
    fetchPolicy: "cache-and-network",
  });

  const company = data?.company ?? null;

  const {
    data: applicationsData,
    loading: applicationsLoading,
    error: applicationsError,
  } = useApplicationsQuery({
    variables: { company: company?.name ?? "" },
    skip: !company,
    fetchPolicy: "cache-and-network",
  });

  const companyApplications = (applicationsData?.applications ?? []).filter(
    (application) => application.companyId === company?.id,
  ) as ApplicationsQuery["applications"];

  const showApplicationsInitialLoading =
    applicationsLoading && !applicationsData;

  const status = deriveDetailStatus(loading, error);

  return {
    company,
    companyApplications,
    applicationsError,
    companiesError: error,
    showApplicationsInitialLoading,
    notFound: status === "notFound",
    status,
  };
}
