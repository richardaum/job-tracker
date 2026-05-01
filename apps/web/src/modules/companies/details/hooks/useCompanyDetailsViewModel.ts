"use client";

import {
  type ApplicationsQuery,
  useApplicationsQuery,
  useCompaniesQuery,
} from "@/gql/hooks";

export function useCompanyDetailsViewModel(companyId: string) {
  const { data, loading, error } = useCompaniesQuery({
    fetchPolicy: "cache-and-network",
  });

  const company = data?.companies.find((item) => item.id === companyId);

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

  return {
    company,
    companyApplications,
    applicationsError,
    companiesError: error,
    showCompaniesInitialLoading: loading && !data,
    showApplicationsInitialLoading: applicationsLoading && !applicationsData,
  };
}
