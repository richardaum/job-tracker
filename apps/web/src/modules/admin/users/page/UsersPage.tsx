"use client";

import { Card, cn, SearchInput, Skeleton, Stack, Tabs, TabsList, TabsTrigger, Text } from "@job-tracker/ui";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { UserStatus } from "@/gql/graphql";
import {
  useApproveRegistrationMutation,
  useRejectRegistrationMutation,
  useReactivateUserMutation,
  useRemoveUserMutation,
  useResendApprovalEmailMutation,
} from "@/gql/hooks";
import { AdminSubtabsSlot } from "@/modules/admin/layout/admin-header.slots";
import { UserCard } from "@/modules/admin/users/components/UserCard";
import { type UsersStatusFilter, useUsersListViewModel } from "@/modules/admin/users/hooks/useUsersListViewModel";

type UsersListSkeletonProps = { count?: number };
function UsersListSkeleton({ count = 4 }: UsersListSkeletonProps) {
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

const STATUS_FILTERS: { value: UsersStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: UserStatus.Pending, label: "Pending" },
  { value: UserStatus.Active, label: "Approved" },
  { value: UserStatus.Rejected, label: "Rejected" },
  { value: UserStatus.Deactivated, label: "Deactivated" },
];

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UsersStatusFilter>("all");

  const { users, error, showInitialLoading, refetch } = useUsersListViewModel(query, statusFilter);
  const [approveRegistration, { loading: approving }] = useApproveRegistrationMutation();
  const [rejectRegistration, { loading: rejecting }] = useRejectRegistrationMutation();
  const [resendApprovalEmail, { loading: resending }] = useResendApprovalEmailMutation();
  const [removeUser, { loading: removing }] = useRemoveUserMutation();
  const [reactivateUser, { loading: reactivating }] = useReactivateUserMutation();

  async function handleApprove(userId: string) {
    await approveRegistration({ variables: { userId } });
    await refetch();
  }

  async function handleReject(userId: string) {
    await rejectRegistration({ variables: { userId } });
    await refetch();
  }

  async function handleResendApprovalEmail(userId: string) {
    await resendApprovalEmail({ variables: { userId } });
  }

  async function handleRemove(userId: string) {
    await removeUser({ variables: { userId } });
    await refetch();
  }

  async function handleReactivate(userId: string) {
    await reactivateUser({ variables: { userId } });
    await refetch();
  }

  return (
    <div className={cn("flex h-full flex-col")}>
      <AdminSubtabsSlot>
        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as UsersStatusFilter)}>
          <TabsList>
            {STATUS_FILTERS.map((filter) => (
              <TabsTrigger key={filter.value} value={filter.value}>
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </AdminSubtabsSlot>

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

        <Text size="sm" color="muted" className={cn("w-full text-left sm:w-auto")}>
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
        ) : users.length === 0 ? (
          <EmptyState
            variant="filtered"
            hasActiveFilter={query.trim().length > 0 || statusFilter !== "all"}
            noMatchMessage="No users match your search."
            emptyListMessage="No users found."
            noMatchDetail="Try a different name, email, or status."
            emptyListDetail="Users will appear here once someone signs in."
          />
        ) : (
          <Stack gap="sm">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onApprove={handleApprove}
                onReject={handleReject}
                onResendApprovalEmail={handleResendApprovalEmail}
                onRemove={handleRemove}
                onReactivate={handleReactivate}
                isMutating={approving || rejecting || resending || removing || reactivating}
              />
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
}
