"use client";

import { Card, cn, SearchInput, Skeleton, Stack, Text } from "@job-tracker/ui";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { UserCard } from "@/modules/admin/users/components/UserCard";
import { useUsersListViewModel } from "@/modules/admin/users/hooks/useUsersListViewModel";

function UsersListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} padding="sm">
          <div className={cn("space-y-3")}>
            <Skeleton variant="text" className={cn("h-5 w-44 max-w-full")} />
            <Skeleton variant="text" className={cn("h-4 w-full max-w-xs")} />
          </div>
        </Card>
      ))}
    </Stack>
  );
}

export default function UsersPage() {
  const [query, setQuery] = useState("");

  const { users, filteredUsers, error, showInitialLoading } =
    useUsersListViewModel(query);

  return (
    <div className={cn("flex h-full flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border-subtle pb-4 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users..."
          ariaLabel="Search users"
        />

        <Text
          size="sm"
          color="muted"
          className={cn("w-full text-left sm:w-auto")}
        >
          {users.length} users
        </Text>
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col overflow-auto py-4")}>
        {showInitialLoading ? (
          <UsersListSkeleton />
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load users. Please refresh the page.
          </Text>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            variant="filtered"
            hasActiveFilter={query.trim().length > 0}
            noMatchMessage="No users match your search."
            emptyListMessage="No users found."
            noMatchDetail="Try a different name or email."
            emptyListDetail="Users will appear here once registered."
          />
        ) : (
          <Stack gap="sm">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={{
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  avatarUrl: user.avatarUrl ?? null,
                }}
              />
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
}
