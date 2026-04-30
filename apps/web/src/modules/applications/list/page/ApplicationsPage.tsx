"use client";

import { useApplicationsQuery } from "@/gql/hooks";
import { ApplicationCard } from "@/modules/applications/list/components/ApplicationCard";
import { ApplicationQuickEditModal } from "@/modules/applications/list/components/ApplicationQuickEditModal";
import { QuickFilters } from "@/modules/applications/list/components/QuickFilters";
import {
  useCompanyFilter,
  useQuickFilter,
} from "@/modules/applications/list/hooks/useQuickFilter";
import { useRouter } from "next/navigation";
import {
  Card,
  DropdownButton,
  DropdownMenuItem,
  Skeleton,
  Stack,
  Text,
  Toast,
  cn,
} from "@job-tracker/ui";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

interface ToastState {
  open: boolean;
  message: string;
  intent: "success" | "error";
}

function ApplicationListCardSkeleton() {
  return (
    <Card padding="sm">
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className={cn("flex min-w-0 flex-col gap-1")}>
          <div className={cn("flex min-w-0 flex-wrap items-center gap-2")}>
            <Skeleton
              variant="text"
              className={cn("h-5 w-[min(12rem,100%)] max-w-full")}
            />
            <Skeleton className={cn("h-6 w-20 shrink-0 rounded-full")} />
            <div className={cn("flex items-center gap-1")}>
              <Skeleton className={cn("size-6 rounded-sm")} />
              <Skeleton className={cn("size-6 rounded-sm")} />
              <Skeleton className={cn("size-6 rounded-sm")} />
            </div>
          </div>
          <div className={cn("flex flex-wrap items-center gap-2")}>
            <Skeleton variant="text" className={cn("h-4 w-28 max-w-full")} />
            <Skeleton variant="text" className={cn("h-4 w-44 max-w-full")} />
            <Skeleton variant="text" className={cn("h-4 w-24 max-w-full")} />
          </div>
          <div className={cn("space-y-1")}>
            <Skeleton variant="text" className={cn("h-4 w-full max-w-2xl")} />
            <Skeleton variant="text" className={cn("h-4 w-full max-w-lg")} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ApplicationsListSkeleton({ count = 3 }: { count?: number } = {}) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }, (_, i) => (
        <ApplicationListCardSkeleton key={i} />
      ))}
    </Stack>
  );
}

function ApplicationsListError() {
  return (
    <Text size="sm" color="error">
      Failed to load applications. Please refresh the page.
    </Text>
  );
}

function ApplicationsListEmpty() {
  return (
    <Card variant="outlined">
      <Stack align="center" justify="center" gap="sm">
        <Text size="sm" color="secondary">
          No applications yet. Add your first one!
        </Text>
      </Stack>
    </Card>
  );
}

export default function ApplicationsPage() {
  const router = useRouter();
  const activeFilter = useQuickFilter();
  const companyFilter = useCompanyFilter();

  const { data, loading, error } = useApplicationsQuery({
    fetchPolicy: "cache-and-network",
    variables: { filter: activeFilter, company: companyFilter },
  });

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    intent: "success",
  });

  const [openModal, setOpenModal] = useState(false);

  function showToast(message: string, intent: "success" | "error") {
    setToast({ open: true, message, intent });
  }

  const applications = data?.applications ?? [];

  return (
    <div className={cn("flex h-full flex-col")}>
      {/* Action bar */}
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border-subtle px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-2 rounded-md border border-border-subtle bg-bg-surface-hover px-3 py-2 sm:max-w-sm",
          )}
        >
          <MagnifyingGlassIcon
            size={14}
            weight="regular"
            className={cn("shrink-0 text-text-muted")}
          />
          <Text
            as="span"
            size="sm"
            color="muted"
            className={cn("min-w-0 flex-1")}
          >
            Search applications...
          </Text>
          <span
            className={cn(
              "rounded border border-border-subtle px-1.5 py-0.5 text-xs text-text-muted",
            )}
          >
            ⌘/
          </span>
        </div>

        <div className={cn("w-full sm:w-auto")}>
          <ApplicationQuickEditModal
            open={openModal}
            onOpenChange={(open) => {
              if (open !== undefined) setOpenModal(open);
            }}
            onSuccess={(msg) => showToast(msg, "success")}
            onError={(msg) => showToast(msg, "error")}
          />
          <DropdownButton
            intent="primary"
            size="sm"
            content={
              <DropdownMenuItem
                onSelect={() => setOpenModal(true)}
                icon={<PlusIcon size={16} weight="bold" />}
              >
                Manual application
              </DropdownMenuItem>
            }
            onClick={() => router.push("/applications/new/ai")}
          >
            <SparkleIcon size={16} weight="bold" className={cn("mr-3")} />
            New application
          </DropdownButton>
        </div>
      </div>

      {/* Quick filters */}
      <QuickFilters />
      {companyFilter ? (
        <div className={cn("border-b border-border-subtle px-4 py-2 sm:px-6")}>
          <Text size="sm" color="secondary">
            Filtering by company:{" "}
            <Text as="span" weight="semibold">
              {companyFilter}
            </Text>
          </Text>
        </div>
      ) : null}

      {/* Content */}
      <div className={cn("flex-1 overflow-auto p-4 sm:p-6")}>
        {loading && !data ? (
          <ApplicationsListSkeleton />
        ) : error ? (
          <ApplicationsListError />
        ) : applications.length === 0 ? (
          <ApplicationsListEmpty />
        ) : (
          <Stack gap="sm">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onSuccess={(msg) => showToast(msg, "success")}
                onError={(msg) => showToast(msg, "error")}
              />
            ))}
          </Stack>
        )}
      </div>

      <Toast
        trigger={<span aria-hidden style={{ display: "none" }} />}
        open={toast.open}
        onOpenChange={(open) => setToast((t) => ({ ...t, open }))}
        title={toast.message}
        intent={toast.intent}
      />
    </div>
  );
}
