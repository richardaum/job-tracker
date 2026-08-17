"use client";

import { Card, cn, SearchInput, Skeleton, Stack, Tabs, TabsList, TabsTrigger, Text } from "@job-tracker/ui";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { UserStatus } from "@/gql/graphql";
import { useApproveRegistrationMutation, useRejectRegistrationMutation } from "@/gql/hooks";
import { AdminSubtabsSlot } from "@/modules/admin/layout/admin-header.slots";
import { RegistrationCard } from "@/modules/admin/registrations/components/RegistrationCard";
import {
  type RegistrationsStatusFilter,
  useRegistrationsListViewModel,
} from "@/modules/admin/registrations/hooks/useRegistrationsListViewModel";

type RegistrationsListSkeletonProps = { count?: number };
function RegistrationsListSkeleton({ count = 4 }: RegistrationsListSkeletonProps) {
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

const STATUS_FILTERS: { value: RegistrationsStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: UserStatus.Pending, label: "Pending" },
  { value: UserStatus.Active, label: "Approved" },
  { value: UserStatus.Rejected, label: "Rejected" },
];

export default function RegistrationsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegistrationsStatusFilter>("all");

  const { filteredRegistrations, error, showInitialLoading, refetch } = useRegistrationsListViewModel(
    query,
    statusFilter,
  );
  const [approveRegistration, { loading: approving }] = useApproveRegistrationMutation();
  const [rejectRegistration, { loading: rejecting }] = useRejectRegistrationMutation();

  async function handleApprove(userId: string) {
    await approveRegistration({ variables: { userId } });
    await refetch();
  }

  async function handleReject(userId: string) {
    await rejectRegistration({ variables: { userId } });
    await refetch();
  }

  return (
    <div className={cn("flex h-full flex-col")}>
      <AdminSubtabsSlot>
        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as RegistrationsStatusFilter)}>
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
          placeholder="Search registrations..."
          ariaLabel="Search registrations"
        />
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col overflow-auto py-4")}>
        {showInitialLoading ? (
          <RegistrationsListSkeleton />
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load registrations. Please refresh the page.
          </Text>
        ) : filteredRegistrations.length === 0 ? (
          <EmptyState
            variant="filtered"
            hasActiveFilter={query.trim().length > 0 || statusFilter !== "all"}
            noMatchMessage="No registrations match your search."
            emptyListMessage="No registrations found."
            noMatchDetail="Try a different name, email, or status."
            emptyListDetail="Registration requests will appear here once someone signs in."
          />
        ) : (
          <Stack gap="sm">
            {filteredRegistrations.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                onApprove={handleApprove}
                onReject={handleReject}
                isMutating={approving || rejecting}
              />
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
}
