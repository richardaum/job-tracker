"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Badge,
  Button,
  Card,
  Heading,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Text,
  Toast,
  cn,
} from "@job-tracker/ui";
import {
  BellIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useApplicationsQuery } from "@/gql/hooks";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ApplicationFormDialog } from "./ApplicationFormDialog";
import { DeleteApplicationDialog } from "./DeleteApplicationDialog";

interface ToastState {
  open: boolean;
  message: string;
  intent: "success" | "error";
}

export default function ApplicationsPage() {
  const { data, loading, error } = useApplicationsQuery({
    fetchPolicy: "cache-and-network",
  });
  const { user } = useCurrentUser();

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    intent: "success",
  });

  function showToast(message: string, intent: "success" | "error") {
    setToast({ open: true, message, intent });
  }

  const applications = data?.applications ?? [];

  const initials =
    user?.name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "";

  return (
    <div className={cn("flex h-full flex-col")}>
      {/* Page header */}
      <div
        className={cn(
          "flex flex-col gap-4 border-b border-border-subtle px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5",
        )}
      >
        <div className={cn("min-w-0")}>
          <Heading as="h1" size="2xl">
            Applications
          </Heading>
          <Text size="sm" color="secondary" className={cn("mt-1")}>
            Track and manage your job applications
          </Text>
        </div>

        <div
          className={cn(
            "flex items-center justify-between gap-3 sm:justify-end sm:gap-4",
          )}
        >
          <IconButton
            intent="ghost"
            size="sm"
            label="Notifications"
            icon={<BellIcon size={18} />}
          />

          {user && (
            <div className={cn("flex min-w-0 items-center gap-3")}>
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={36}
                  height={36}
                  className={cn("rounded-full object-cover")}
                />
              ) : (
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-brand-subtle text-sm font-semibold text-text-brand",
                  )}
                >
                  {initials}
                </div>
              )}
              <div className={cn("min-w-0")}>
                <Text size="sm" weight="semibold" className={cn("truncate")}>
                  {user.name}
                </Text>
                <Text
                  size="xs"
                  color="muted"
                  className={cn("hidden truncate sm:block")}
                >
                  {user.email}
                </Text>
              </div>
            </div>
          )}
        </div>
      </div>

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
          <ApplicationFormDialog
            trigger={
              <Button
                intent="primary"
                size="sm"
                leftIcon={<PlusIcon size={16} weight="bold" />}
                className={cn("w-full sm:w-auto")}
              >
                New application
              </Button>
            }
            onSuccess={(msg) => showToast(msg, "success")}
            onError={(msg) => showToast(msg, "error")}
          />
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex-1 overflow-auto p-4 sm:p-6")}>
        {loading && !data ? (
          <Stack gap="sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} padding="xs">
                <Stack gap="xs">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load applications. Please refresh the page.
          </Text>
        ) : applications.length === 0 ? (
          <Card variant="outlined">
            <Stack align="center" justify="center" gap="sm">
              <Text size="sm" color="secondary">
                No applications yet. Add your first one!
              </Text>
            </Stack>
          </Card>
        ) : (
          <Stack gap="sm">
            {applications.map((app) => (
              <Card key={app.id} padding="sm">
                <div
                  className={cn(
                    "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
                  )}
                >
                  <div className={cn("flex min-w-0 flex-col gap-1")}>
                    <div
                      className={cn(
                        "flex min-w-0 flex-wrap items-center gap-2",
                      )}
                    >
                      <Text as="span" size="base" weight="medium">
                        {app.title}
                      </Text>
                      <Badge intent="default">{app.company}</Badge>
                    </div>
                    <div className={cn("flex flex-wrap items-center gap-2")}>
                      <Text as="span" size="sm" color="secondary">
                        Applied{" "}
                        {new Date(app.appliedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                      {app.url ? (
                        <>
                          <span className={cn("text-text-muted")} aria-hidden>
                            ·
                          </span>
                          <Link href={app.url} variant="default">
                            View posting
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-2 self-end sm:self-auto",
                    )}
                  >
                    <ApplicationFormDialog
                      trigger={
                        <IconButton
                          intent="ghost"
                          size="sm"
                          label={`Edit ${app.title}`}
                          icon={<PencilSimpleIcon size={16} weight="regular" />}
                        />
                      }
                      application={{
                        id: app.id,
                        title: app.title,
                        company: app.company,
                        url: app.url,
                        appliedAt: app.appliedAt,
                      }}
                      onSuccess={(msg) => showToast(msg, "success")}
                      onError={(msg) => showToast(msg, "error")}
                    />
                    <DeleteApplicationDialog
                      trigger={
                        <IconButton
                          intent="ghost"
                          size="sm"
                          label={`Delete ${app.title}`}
                          icon={<TrashIcon size={16} weight="regular" />}
                        />
                      }
                      applicationId={app.id}
                      applicationTitle={app.title}
                      onSuccess={(msg) => showToast(msg, "success")}
                      onError={(msg) => showToast(msg, "error")}
                    />
                  </div>
                </div>
              </Card>
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
