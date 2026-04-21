"use client";

import React, { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Toast,
} from "@job-tracker/ui";
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useApplicationsQuery } from "@/gql/hooks";
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

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    intent: "success",
  });

  function showToast(message: string, intent: "success" | "error") {
    setToast({ open: true, message, intent });
  }

  const applications = data?.applications ?? [];

  return (
    <Container>
      <Stack gap="section">
        <Stack direction="row" align="center" justify="between">
          <h1 className="text-2xl font-bold text-text-primary">Applications</h1>
          <ApplicationFormDialog
            trigger={
              <Button
                intent="primary"
                size="sm"
                leftIcon={<Plus size={16} weight="bold" />}
              >
                New application
              </Button>
            }
            onSuccess={(msg) => showToast(msg, "success")}
            onError={(msg) => showToast(msg, "error")}
          />
        </Stack>

        {loading && !data ? (
          <Stack gap="card">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <Stack gap="form">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : error ? (
          <p className="text-sm text-text-error">
            Failed to load applications. Please refresh the page.
          </p>
        ) : applications.length === 0 ? (
          <Card variant="outlined">
            <Stack align="center" justify="center" gap="form">
              <p className="text-sm text-text-secondary">
                No applications yet. Add your first one!
              </p>
            </Stack>
          </Card>
        ) : (
          <Stack gap="card">
            {applications.map((app) => (
              <Card key={app.id}>
                <Stack direction="row" align="center" justify="between">
                  <Stack gap="form">
                    <Stack direction="row" align="center" gap="inline">
                      <span className="text-base font-medium text-text-primary">
                        {app.title}
                      </span>
                      <Badge intent="default">{app.company}</Badge>
                    </Stack>
                    <Stack direction="row" align="center" gap="inline">
                      <span className="text-sm text-text-secondary">
                        Applied{" "}
                        {new Date(app.appliedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {app.url ? (
                        <>
                          <span className="text-text-muted" aria-hidden>
                            ·
                          </span>
                          <Link href={app.url} variant="default">
                            View posting
                          </Link>
                        </>
                      ) : null}
                    </Stack>
                  </Stack>

                  <Stack direction="row" gap="inline" align="center">
                    <ApplicationFormDialog
                      trigger={
                        <IconButton
                          intent="ghost"
                          size="sm"
                          label={`Edit ${app.title}`}
                          icon={<PencilSimple size={16} weight="regular" />}
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
                          icon={<Trash size={16} weight="regular" />}
                        />
                      }
                      applicationId={app.id}
                      applicationTitle={app.title}
                      onSuccess={(msg) => showToast(msg, "success")}
                      onError={(msg) => showToast(msg, "error")}
                    />
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      <Toast
        trigger={<span aria-hidden style={{ display: "none" }} />}
        open={toast.open}
        onOpenChange={(open) => setToast((t) => ({ ...t, open }))}
        title={toast.message}
        intent={toast.intent}
      />
    </Container>
  );
}
