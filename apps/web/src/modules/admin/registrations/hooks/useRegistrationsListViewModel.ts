"use client";

import { UserStatus } from "@/gql/graphql";
import { useAdminRegistrationsQuery } from "@/gql/hooks";

export type RegistrationsStatusFilter = "all" | UserStatus;

export function useRegistrationsListViewModel(searchQuery: string, statusFilter: RegistrationsStatusFilter) {
  const { data, loading, error, refetch } = useAdminRegistrationsQuery({ fetchPolicy: "cache-and-network" });

  const registrations = data?.registrations ?? [];
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredRegistrations = registrations.filter((registration) => {
    const matchesStatus = statusFilter === "all" || registration.status === statusFilter;
    const matchesSearch = normalizedSearch
      ? registration.name.toLowerCase().includes(normalizedSearch) ||
        registration.email.toLowerCase().includes(normalizedSearch)
      : true;
    return matchesStatus && matchesSearch;
  });

  return { registrations, filteredRegistrations, loading, error, showInitialLoading: loading && !data, refetch };
}
