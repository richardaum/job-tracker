"use client";

import { useEffect, useState } from "react";

import { UserStatus } from "@/gql/graphql";
import { useAdminUsersQuery } from "@/gql/hooks";

export type UsersStatusFilter = "all" | UserStatus;

const SEARCH_DEBOUNCE_MS = 300;

export function useUsersListViewModel(searchQuery: string, statusFilter: UsersStatusFilter) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery.trim());

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchQuery.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const { data, loading, error, refetch } = useAdminUsersQuery({
    variables: { status: statusFilter === "all" ? undefined : statusFilter, search: debouncedSearch || undefined },
    fetchPolicy: "cache-and-network",
  });

  const users = data?.registrations ?? [];

  return { users, loading, error, showInitialLoading: loading && !data, refetch };
}
