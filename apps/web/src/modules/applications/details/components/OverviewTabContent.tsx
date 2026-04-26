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
  useUpdateCompanyMutation,
} from "@/gql/hooks";
import { TipTapEditor } from "./TipTapEditor";
import {
  EMPTY_TIPTAP_DOC,
  normalizeTipTapDocument,
  tipTapToPlainText,
} from "@/modules/applications/shared/utils/tiptap";
import type { ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";
import {
  FieldEditTriggerButton,
  HoverEditableFieldRow,
} from "./HoverEditableFieldRow";
import { CompensationEditDialog } from "./CompensationEditDialog";
import { ApplicationTags } from "@/modules/applications/shared/utils/ApplicationTags";
import { formatCompensationLine } from "@/modules/applications/shared/utils/compensationFormat";
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

function CompanyEditDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  application,
  onSuccess,
  onError,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  application: ApplicationDetailsValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

  const [nameDraft, setNameDraft] = useState(application.company.name);
  const [descriptionDraft, setDescriptionDraft] = useState(
    normalizeTipTapDocument(application.company.description),
  );
  const [saving, setSaving] = useState(false);

  const [updateApplication] = useUpdateApplicationMutation({
    refetchQueries: [
      { query: ApplicationDocument, variables: { id: application.id } },
      { query: ApplicationsDocument },
    ],
  });

  const [updateCompany] = useUpdateCompanyMutation({
    refetchQueries: [
      { query: ApplicationDocument, variables: { id: application.id } },
      { query: ApplicationsDocument },
    ],
  });

  async function handleSave() {
    const nextName = nameDraft.trim();
    const nextDescription =
      tipTapToPlainText(descriptionDraft).trim().length > 0
        ? descriptionDraft
        : null;

    const nameChanged = nextName !== application.company.name;
    const descriptionChanged =
      (nextDescription ?? "") !==
      normalizeTipTapDocument(application.company.description);

    if (!nextName || (!nameChanged && !descriptionChanged)) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    try {
      let targetCompanyId = application.company.id;

      if (nameChanged) {
        const result = await updateApplication({
          variables: { id: application.id, input: { company: nextName } },
        });
        targetCompanyId =
          result.data?.updateApplication.company.id ?? targetCompanyId;
      }

      if (descriptionChanged) {
        await updateCompany({
          variables: {
            id: targetCompanyId,
            input: { description: nextDescription },
          },
        });
      }

      onSuccess?.("Company updated.");
      onOpenChange(false);
    } catch {
      onError?.("Could not update company.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      title="Edit company"
      size="2xl"
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) {
          setNameDraft(application.company.name);
          setDescriptionDraft(
            normalizeTipTapDocument(application.company.description),
          );
        }
      }}
      trigger={
        controlledOpen !== undefined ? (
          <span aria-hidden style={{ display: "none" }} />
        ) : (
          <FieldEditTriggerButton label="Edit company" />
        )
      }
    >
      <Stack gap="sm">
        <FormField label="Company name" htmlFor="edit-company-name">
          <Input
            id="edit-company-name"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="e.g. Acme Corp"
            disabled={saving}
          />
        </FormField>
        <FormField label="Description" htmlFor="edit-company-description">
          <TipTapEditor
            id="edit-company-description"
            value={descriptionDraft}
            onChange={(nextValue) =>
              setDescriptionDraft(nextValue || EMPTY_TIPTAP_DOC)
            }
            autofocus="end"
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            size="sm"
            onClick={() => void handleSave()}
            disabled={!nameDraft.trim() || saving}
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
  const [editCompanyOpen, setEditCompanyOpen] = useState(false);

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
            <>
              <CompanyNameWithPopover
                name={application.company.name}
                description={application.company.description}
                onEditDescription={() => setEditCompanyOpen(true)}
              />
              <CompanyEditDialog
                open={editCompanyOpen}
                onOpenChange={setEditCompanyOpen}
                application={application}
                onSuccess={onSuccess}
                onError={onError}
              />
            </>
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
