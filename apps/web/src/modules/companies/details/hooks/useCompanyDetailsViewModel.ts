"use client";

import { type JobsQuery, useCompanyQuery, useJobsQuery } from "@/gql/hooks";
import { deriveDetailStatus } from "@/lib/entity-detail-view-status";

export function useCompanyDetailsViewModel(companyId: string) {
  const { data, loading, error } = useCompanyQuery({ variables: { id: companyId }, fetchPolicy: "cache-and-network" });

  const company = data?.company ?? null;

  const {
    data: jobsData,
    loading: jobsLoading,
    error: jobsError,
  } = useJobsQuery({ variables: { company: company?.name ?? "" }, skip: !company, fetchPolicy: "cache-and-network" });

  const companyJobs = ((jobsData as JobsQuery | undefined)?.jobs ?? []).filter((job) => job.companyId === company?.id);

  const showApplicationsInitialLoading = jobsLoading && !jobsData;

  const status = deriveDetailStatus(loading, error);

  return {
    company,
    companyJobs,
    applicationsError: jobsError,
    companiesError: error,
    showApplicationsInitialLoading,
    notFound: status === "notFound",
    status,
  };
}
