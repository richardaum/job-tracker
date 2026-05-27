"use client";

import { useAdminUsersQuery } from "@/gql/hooks";

export function useUsersListViewModel(searchQuery: string) {
  const { data, loading, error } = useAdminUsersQuery({
    fetchPolicy: "cache-and-network",
  });

  const users = data?.users ?? [];
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredUsers = normalizedSearch
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(normalizedSearch) ||
          user.email.toLowerCase().includes(normalizedSearch),
      )
    : users;

  return {
    users,
    filteredUsers,
    loading,
    error,
    showInitialLoading: loading && !data,
  };
}
