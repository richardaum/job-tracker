"use client";

import React, { useState } from "react";
import {
  Button,
  Dialog,
  FormField,
  Input,
  Link,
  Stack,
  Text,
  cn,
} from "@job-tracker/ui";
import {
  ApplicationDocument,
  ApplicationsDocument,
  useUpdateApplicationMutation,
} from "@/gql/hooks";
import type { ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";
import {
  FieldEditTriggerButton,
  HoverEditableFieldRow,
} from "./HoverEditableFieldRow";

function TextFieldEditDialog({
  label,
  value,
  placeholder,
  onSave,
}: {
  label: string;
  value: string;
  placeholder: string;
  onSave: (nextValue: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const next = draft.trim();
    if (!next || next === value) return;
    setSaving(true);
    try {
      await onSave(next);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraft(value);
    }
  }

  return (
    <Dialog
      title={`Edit ${label.toLowerCase()}`}
      open={open}
      onOpenChange={handleOpenChange}
      trigger={<FieldEditTriggerButton label={`Edit ${label}`} />}
    >
      <Stack gap="sm">
        <FormField
          label={label}
          htmlFor={`edit-${label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <Input
            id={`edit-${label.toLowerCase().replace(/\s+/g, "-")}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder}
            disabled={saving}
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            size="sm"
            onClick={() => void handleSave()}
            disabled={!draft.trim() || draft.trim() === value}
            state={saving ? "loading" : "default"}
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}

function UrlFieldEditDialog({
  value,
  onSave,
}: {
  value?: string | null;
  onSave: (nextValue: string | null) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const normalized = value ?? "";
  const isValidUrl =
    draft.trim().length === 0 || /^https?:\/\/.+/.test(draft.trim());

  async function handleSave() {
    const next = draft.trim();
    const nextValue = next.length === 0 ? null : next;
    if (!isValidUrl || next === normalized) return;
    setSaving(true);
    try {
      await onSave(nextValue);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraft(value ?? "");
    }
  }

  return (
    <Dialog
      title="Edit job URL"
      open={open}
      onOpenChange={handleOpenChange}
      trigger={<FieldEditTriggerButton label="Edit job URL" />}
    >
      <Stack gap="sm">
        <FormField
          label="Job URL"
          htmlFor="edit-job-url"
          error={
            !isValidUrl ? "URL must start with http:// or https://" : undefined
          }
        >
          <Input
            id="edit-job-url"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://example.com/jobs/123"
            disabled={saving}
            state={!isValidUrl ? "error" : "default"}
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            size="sm"
            onClick={() => void handleSave()}
            disabled={!isValidUrl || draft.trim() === normalized}
            state={saving ? "loading" : "default"}
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}

export function OverviewTabContent({
  application,
  onSuccess,
  onError,
}: {
  application: ApplicationDetailsValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) {
  const [updateApplication] = useUpdateApplicationMutation({
    refetchQueries: [
      { query: ApplicationDocument, variables: { id: application.id } },
      { query: ApplicationsDocument },
    ],
  });

  async function handleSaveTitle(nextValue: string) {
    try {
      await updateApplication({
        variables: { id: application.id, input: { title: nextValue } },
      });
      onSuccess?.("Title updated.");
    } catch {
      onError?.("Could not update title.");
    }
  }

  async function handleSaveCompany(nextValue: string) {
    try {
      await updateApplication({
        variables: { id: application.id, input: { company: nextValue } },
      });
      onSuccess?.("Company updated.");
    } catch {
      onError?.("Could not update company.");
    }
  }

  async function handleSaveUrl(nextValue: string | null) {
    try {
      await updateApplication({
        variables: { id: application.id, input: { url: nextValue } },
      });
      onSuccess?.("Job URL updated.");
    } catch {
      onError?.("Could not update job URL.");
    }
  }

  return (
    <div className={cn("flex flex-wrap items-start gap-x-8 gap-y-4")}>
      <div className={cn("max-w-full")}>
        <HoverEditableFieldRow
          label="Job title"
          content={<Text size="sm">{application.title}</Text>}
          editControl={
            <TextFieldEditDialog
              label="Job title"
              value={application.title}
              placeholder="e.g. Senior Frontend Engineer"
              onSave={handleSaveTitle}
            />
          }
        />
      </div>

      <div className={cn("max-w-full")}>
        <HoverEditableFieldRow
          label="Company"
          content={<Text size="sm">{application.company}</Text>}
          editControl={
            <TextFieldEditDialog
              label="Company"
              value={application.company}
              placeholder="e.g. Acme Corp"
              onSave={handleSaveCompany}
            />
          }
        />
      </div>

      <div className={cn("max-w-full")}>
        <HoverEditableFieldRow
          label="Job URL"
          content={
            application.url ? (
              <Link href={application.url} variant="default">
                View posting
              </Link>
            ) : (
              <Text size="sm" color="secondary">
                Not set
              </Text>
            )
          }
          editControl={
            <UrlFieldEditDialog
              value={application.url}
              onSave={handleSaveUrl}
            />
          }
        />
      </div>
    </div>
  );
}
