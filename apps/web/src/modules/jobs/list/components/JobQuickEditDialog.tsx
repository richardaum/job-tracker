"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  Combobox,
  Dialog,
  FormField,
  Input,
  Stack,
} from "@job-tracker/ui";
import { type DialogControl } from "@job-tracker/ui";
import React, { useState } from "react";

import {
  JobsDocument,
  useCompaniesQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
} from "@/gql/hooks";

interface JobValues {
  id: string;
  title: string;
  company: string;
  urls: string[];
  location?: string | null;
  workRegion?: string | null;
}

interface FormState {
  title: string;
  company: string;
  urlsText: string;
  location: string;
  workRegion: string;
}

interface JobQuickEditDialogFormProps {
  isEdit: boolean;
  job?: JobValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onCreated?: (jobId: string) => void;
  onClose: () => void;
}

function JobQuickEditDialogForm({
  isEdit,
  job,
  onSuccess,
  onError,
  onCreated,
  onClose,
}: JobQuickEditDialogFormProps) {
  const [form, setForm] = useState<FormState>({
    title: job?.title ?? "",
    company: job?.company ?? "",
    urlsText: (job?.urls ?? []).join("\n"),
    location: job?.location ?? "",
    workRegion: job?.workRegion ?? "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const refetchQueries = [{ query: JobsDocument }];
  const [createJob, { loading: creating }] = useCreateJobMutation({
    refetchQueries,
    awaitRefetchQueries: true,
  });
  const [updateJob, { loading: updating }] = useUpdateJobMutation({
    refetchQueries,
    awaitRefetchQueries: true,
  });
  const loading = creating || updating;

  const { data: companiesData } = useCompaniesQuery();
  const companyOptions = (companiesData?.companies ?? []).map((c) => ({
    label: c.name,
    value: c.id,
  }));

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate(): boolean {
    const next: Partial<FormState> = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.company.trim()) next.company = "Company is required.";
    const urls = form.urlsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    if (urls.some((url) => !/^https?:\/\/.+/.test(url))) {
      next.urlsText = "Each URL must start with http:// or https://";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const input = {
      title: form.title.trim(),
      company: form.company.trim(),
      urls: form.urlsText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      location: form.location.trim() || null,
      workRegion: form.workRegion.trim() || null,
    };

    if (isEdit && job) {
      const [error] = await tryRun(
        updateJob({ variables: { id: job.id, input } }),
      );
      if (error) {
        onError?.("Something went wrong. Please try again.");
        return;
      }
      onSuccess?.("Job updated.");
      onClose();
      return;
    }

    const [error, result] = await tryRun(createJob({ variables: { input } }));
    if (error) {
      onError?.("Something went wrong. Please try again.");
      return;
    }
    const createdJobId = result.data?.createJob.id;
    onSuccess?.("Job created.");
    if (createdJobId) {
      onCreated?.(createdJobId);
    }
    onClose();
  }

  const formId = "job-quick-edit-dialog-form";

  return (
    <>
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <Stack gap="sm">
          <FormField
            label="Job title"
            htmlFor="job-title"
            required
            error={errors.title}
          >
            <Input
              id="job-title"
              value={form.title}
              onChange={set("title")}
              placeholder="e.g. Senior Frontend Engineer"
              state={errors.title ? "error" : "default"}
              disabled={loading}
            />
          </FormField>

          <FormField
            label="Company"
            htmlFor="job-company"
            required
            error={errors.company}
          >
            <Combobox
              id="job-company"
              value={form.company}
              onInputValueChange={(text) =>
                setForm((f) => ({ ...f, company: text }))
              }
              onValueChange={(option) =>
                setForm((f) => ({ ...f, company: option.label }))
              }
              options={companyOptions}
              placeholder="e.g. Acme Corp"
              state={errors.company ? "error" : "default"}
              disabled={loading}
            />
          </FormField>

          <FormField
            label="Job URLs"
            htmlFor="job-urls"
            error={errors.urlsText}
          >
            <Input
              id="job-urls"
              value={form.urlsText}
              onChange={set("urlsText")}
              placeholder="https://example.com/jobs/123"
              state={errors.urlsText ? "error" : "default"}
              disabled={loading}
            />
          </FormField>

          <FormField label="Location" htmlFor="job-location">
            <Input
              id="job-location"
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. São Paulo, SP"
              disabled={loading}
            />
          </FormField>

          <FormField label="Work region" htmlFor="job-work-region">
            <Input
              id="job-work-region"
              value={form.workRegion}
              onChange={set("workRegion")}
              placeholder="e.g. Brazil, Latam, Anywhere"
              disabled={loading}
            />
          </FormField>
        </Stack>
      </form>

      <Stack direction="row" gap="xs" justify="end" className={cn("mt-4")}>
        <Button
          intent="secondary"
          size="md"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form={formId}
          intent="primary"
          size="md"
          state={loading ? "loading" : "default"}
        >
          {isEdit ? "Save changes" : "Create"}
        </Button>
      </Stack>
    </>
  );
}

export interface JobQuickEditDialogProps {
  control: DialogControl;
  job?: JobValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onCreated?: (jobId: string) => void;
}

export function JobQuickEditDialog({
  control,
  job,
  onSuccess,
  onError,
  onCreated,
}: JobQuickEditDialogProps) {
  const isEdit = Boolean(job);

  return (
    <Dialog
      title={isEdit ? "Edit job" : "New job"}
      description={
        isEdit
          ? "Update core job details like title, company, and URLs."
          : "Add a new job with a title, company, and optional URLs."
      }
      open={control.isOpen}
      onOpenChange={control.onOpenChange}
    >
      {control.isOpen ? (
        <JobQuickEditDialogForm
          isEdit={isEdit}
          job={job}
          onSuccess={onSuccess}
          onError={onError}
          onCreated={onCreated}
          onClose={() => control.onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}
