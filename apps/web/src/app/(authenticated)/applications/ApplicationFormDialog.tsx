"use client";

import React, { useState } from "react";
import { Button, Dialog, FormField, Input, Stack, cn } from "@job-tracker/ui";
import {
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  ApplicationsDocument,
} from "@/gql/hooks";

interface ApplicationValues {
  id: string;
  title: string;
  company: string;
  url?: string | null;
  appliedAt: string;
}

interface FormState {
  title: string;
  company: string;
  url: string;
  appliedAt: string;
}

interface ApplicationFormBodyProps {
  isEdit: boolean;
  application?: ApplicationValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onClose: () => void;
}

function ApplicationFormBody({
  isEdit,
  application,
  onSuccess,
  onError,
  onClose,
}: ApplicationFormBodyProps) {
  const [form, setForm] = useState<FormState>({
    title: application?.title ?? "",
    company: application?.company ?? "",
    url: application?.url ?? "",
    appliedAt: application?.appliedAt
      ? application.appliedAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const refetchQueries = [{ query: ApplicationsDocument }];
  const [createApplication, { loading: creating }] =
    useCreateApplicationMutation({ refetchQueries });
  const [updateApplication, { loading: updating }] =
    useUpdateApplicationMutation({ refetchQueries });
  const loading = creating || updating;

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate(): boolean {
    const next: Partial<FormState> = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.company.trim()) next.company = "Company is required.";
    if (!form.appliedAt) next.appliedAt = "Applied date is required.";
    if (form.url && !/^https?:\/\/.+/.test(form.url))
      next.url = "URL must start with http:// or https://";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const input = {
      title: form.title.trim(),
      company: form.company.trim(),
      url: form.url.trim() || null,
      appliedAt: new Date(form.appliedAt),
    };

    try {
      if (isEdit && application) {
        await updateApplication({ variables: { id: application.id, input } });
        onSuccess?.("Application updated.");
      } else {
        await createApplication({ variables: { input } });
        onSuccess?.("Application created.");
      }
      onClose();
    } catch {
      onError?.("Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <form id="application-form" onSubmit={handleSubmit} noValidate>
        <Stack gap="sm">
          <FormField
            label="Job title"
            htmlFor="app-title"
            required
            error={errors.title}
          >
            <Input
              id="app-title"
              value={form.title}
              onChange={set("title")}
              placeholder="e.g. Senior Frontend Engineer"
              state={errors.title ? "error" : "default"}
              disabled={loading}
            />
          </FormField>

          <FormField
            label="Company"
            htmlFor="app-company"
            required
            error={errors.company}
          >
            <Input
              id="app-company"
              value={form.company}
              onChange={set("company")}
              placeholder="e.g. Acme Corp"
              state={errors.company ? "error" : "default"}
              disabled={loading}
            />
          </FormField>

          <FormField
            label="Job URL"
            htmlFor="app-url"
            error={errors.url}
            hint="Optional — link to the job posting"
          >
            <Input
              id="app-url"
              type="url"
              value={form.url}
              onChange={set("url")}
              placeholder="https://example.com/jobs/123"
              state={errors.url ? "error" : "default"}
              disabled={loading}
            />
          </FormField>

          <FormField
            label="Applied date"
            htmlFor="app-applied-at"
            required
            error={errors.appliedAt}
          >
            <Input
              id="app-applied-at"
              type="date"
              value={form.appliedAt}
              onChange={set("appliedAt")}
              state={errors.appliedAt ? "error" : "default"}
              disabled={loading}
            />
          </FormField>
        </Stack>
      </form>

      <Stack direction="row" gap="xs" justify="end" className={cn("mt-4")}>
        <Button
          intent="secondary"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="application-form"
          intent="primary"
          size="sm"
          state={loading ? "loading" : "default"}
        >
          {isEdit ? "Save changes" : "Create"}
        </Button>
      </Stack>
    </>
  );
}

interface ApplicationFormDialogProps {
  trigger: React.ReactElement;
  application?: ApplicationValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function ApplicationFormDialog({
  trigger,
  application,
  onSuccess,
  onError,
}: ApplicationFormDialogProps) {
  const isEdit = Boolean(application);
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      trigger={trigger}
      title={isEdit ? "Edit application" : "New application"}
      open={open}
      onOpenChange={setOpen}
    >
      {open ? (
        <ApplicationFormBody
          isEdit={isEdit}
          application={application}
          onSuccess={onSuccess}
          onError={onError}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </Dialog>
  );
}
