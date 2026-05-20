"use client";

import { type JobsQuery, useCompaniesQuery, useJobsQuery } from "@/gql/hooks";

export function useCompanyDetailsViewModel(companyId: string) {
  const { data, loading, error } = useCompaniesQuery({
    fetchPolicy: "cache-and-network",
  });

  const company = data?.companies.find((item) => item.id === companyId);

  const {
    data: applicationsData,
    loading: applicationsLoading,
    error: applicationsError,
  } = useJobsQuery({
    variables: { company: company?.name ?? "" },
    skip: !company,
    fetchPolicy: "cache-and-network",
  });

  const companyJobs = (applicationsData?.jobs ?? []).filter(
    (job) => job.companyId === company?.id,
  );

  return {
    company,
    companyJobs,
    applicationsError,
    companiesError: error,
    showCompaniesInitialLoading: loading && !data,
    showApplicationsInitialLoading: applicationsLoading && !applicationsData,
  };
}
