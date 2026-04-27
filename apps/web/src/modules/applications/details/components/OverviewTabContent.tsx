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
  TagsInput,
  type TagWithMetadata,
} from "@/modules/applications/shared/components/TagsInput";
import {
  ApplicationDocument,
  ApplicationsDocument,
  useRemoveApplicationTagMutation,
  useUpdateApplicationMutation,
} from "@/gql/hooks";
import type { ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";
import {
  FieldEditTriggerButton,
  HoverEditableFieldRow,
} from "./HoverEditableFieldRow";
import { CompensationEditDialog } from "./CompensationEditDialog";
import { ApplicationTags } from "@/modules/applications/shared/utils/ApplicationTags";
import { formatCompensationLine } from "@/modules/applications/shared/utils/compensationFormat";
import { CompanyEditDialog } from "@/modules/applications/shared/components/CompanyEditDialog";
import { CompanyNameWithPopover } from "@/modules/applications/shared/components/CompanyNameWithPopover";

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

function TagsEditDialog({
  applicationId,
  tags,
  onSuccess,
  onError,
}: {
  applicationId: string;
  tags: string[];
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TagWithMetadata[]>([]);
  const [saving, setSaving] = useState(false);

  const [update] = useUpdateApplicationMutation({
    refetchQueries: [
      { query: ApplicationDocument, variables: { id: applicationId } },
      { query: ApplicationsDocument },
    ],
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDraft(tags.map((tag) => ({ label: tag })));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await update({
        variables: {
          id: applicationId,
          input: {
            tags: draft
              .map((tag) => tag.label.trim())
              .filter((tag) => tag.length > 0),
          },
        },
      });
      onSuccess?.("Tags updated.");
      setOpen(false);
    } catch {
      onError?.("Could not update tags.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      title="Edit tags"
      open={open}
      onOpenChange={handleOpenChange}
      trigger={<FieldEditTriggerButton label="Edit tags" />}
    >
      <Stack gap="sm">
        <FormField
          label="Tags"
          htmlFor="ov-tags"
          hint="Press Enter or comma to add"
        >
          <TagsInput
            id="ov-tags"
            value={draft}
            onChange={setDraft}
            disabled={saving}
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            size="sm"
            onClick={() => void handleSave()}
            state={saving ? "loading" : "default"}
            disabled={saving}
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

  const [removeApplicationTag] = useRemoveApplicationTagMutation({
    refetchQueries: [
      { query: ApplicationDocument, variables: { id: application.id } },
      { query: ApplicationsDocument },
    ],
  });

  async function handleRemoveTag(tag: string) {
    try {
      await removeApplicationTag({ variables: { id: application.id, tag } });
      onSuccess?.("Tag removed.");
    } catch {
      onError?.("Could not remove tag.");
    }
  }

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

  const compLine = formatCompensationLine({
    salaryMinCents: application.salaryMinCents,
    salaryMaxCents: application.salaryMaxCents,
    salaryCurrency: application.salaryCurrency,
    salaryPeriod: application.salaryPeriod,
  });
  const tags = application.tags ?? [];

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
          content={
            <CompanyNameWithPopover
              application={application}
              onSuccess={onSuccess}
              onError={onError}
            />
          }
          editControl={
            <CompanyEditDialog
              application={application}
              onSuccess={onSuccess}
              onError={onError}
            />
          }
        />
      </div>

      <div className={cn("max-w-full")}>
        <HoverEditableFieldRow
          label="Job URL"
          content={
            application.url ? (
              <Link
                href={application.url}
                variant="default"
                className="block leading-normal"
              >
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

      <div className={cn("max-w-full sm:col-span-2")}>
        <HoverEditableFieldRow
          label="Compensation"
          content={
            compLine ? (
              <Text size="sm">{compLine}</Text>
            ) : (
              <Text size="sm" color="secondary">
                Not set
              </Text>
            )
          }
          editControl={
            <CompensationEditDialog
              application={application}
              onSuccess={onSuccess}
              onError={onError}
            />
          }
        />
      </div>

      <div className={cn("max-w-full sm:col-span-2")}>
        <HoverEditableFieldRow
          label="Tags"
          content={
            tags.length > 0 ? (
              <ApplicationTags tags={tags} onRemoveTag={handleRemoveTag} />
            ) : (
              <Text size="sm" color="secondary">
                No tags
              </Text>
            )
          }
          editControl={
            <TagsEditDialog
              applicationId={application.id}
              tags={tags}
              onSuccess={onSuccess}
              onError={onError}
            />
          }
        />
      </div>
    </div>
  );
}
