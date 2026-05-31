"use client";

import { useCompaniesQuery } from "@/gql/hooks";

export function useCompaniesListViewModel(searchQuery: string) {
  const { data, loading, error } = useCompaniesQuery({
    fetchPolicy: "cache-and-network",
  });

  const companies = data?.companies ?? [];
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredCompanies = normalizedSearch
    ? companies.filter((company) => company.name.toLowerCase().includes(normalizedSearch))
    : companies;

  const scrollKey = `companies-list:${normalizedSearch}`;
  const recentlyVisitedCompanyStorageKey = `companies-list:recently-visited:${normalizedSearch}`;

  return {
    companies,
    filteredCompanies,
    loading,
    error,
    showInitialLoading: loading && !data,
    scrollKey,
    recentlyVisitedCompanyStorageKey,
  };
}
