"use client";

import { Button, cn, Combobox, Dialog, FormField, Input, Stack, useDialog } from "@job-tracker/ui";
import { type DialogControl } from "@job-tracker/ui";
import { Controller, useForm } from "react-hook-form";
import type { ReactElement } from "react";

import { useCompaniesQuery } from "@/gql/hooks";

interface JobValues {
  id: string;
  title: string;
  company: string;
  urls: string[];
  location?: string | null;
  workRegion?: string | null;
}

interface JobQuickEditFormValues {
  title: string;
  company: string;
  urlsText: string;
  location: string;
  workRegion: string;
}

export interface JobQuickEditInput {
  title: string;
  company: string;
  urls: string[];
  location: string | null;
  workRegion: string | null;
}

interface JobQuickEditDialogFormProps {
  isEdit: boolean;
  job?: JobValues;
  loading: boolean;
  onCreate?: (input: JobQuickEditInput) => Promise<boolean>;
  onUpdate?: (jobId: string, input: JobQuickEditInput) => Promise<boolean>;
  onClose: () => void;
}

function JobQuickEditDialogForm({ isEdit, job, loading, onCreate, onUpdate, onClose }: JobQuickEditDialogFormProps) {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<JobQuickEditFormValues>({
    defaultValues: {
      title: job?.title ?? "",
      company: job?.company ?? "",
      urlsText: (job?.urls ?? []).join("\n"),
      location: job?.location ?? "",
      workRegion: job?.workRegion ?? "",
    },
  });

  const { data: companiesData } = useCompaniesQuery();
  const companyOptions = (companiesData?.companies ?? []).map((c) => ({ label: c.name, value: c.id }));

  async function submit(form: JobQuickEditFormValues) {
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

    const didSubmit = job ? await onUpdate?.(job.id, input) : await onCreate?.(input);
    if (didSubmit) onClose();
  }

  const formId = "job-quick-edit-dialog-form";

  return (
    <>
      <form id={formId} onSubmit={handleSubmit(submit)} noValidate>
        <Stack gap="sm">
          <FormField label="Job title" htmlFor="job-title" required error={errors.title?.message}>
            <Input
              id="job-title"
              data-onboarding-step="job-title-input"
              autoComplete="off"
              placeholder="e.g. Senior Frontend Engineer"
              state={errors.title ? "error" : "default"}
              disabled={loading}
              {...register("title", { validate: (value) => Boolean(value.trim()) || "Title is required." })}
            />
          </FormField>

          <FormField label="Company" htmlFor="job-company" required error={errors.company?.message}>
            <div data-onboarding-step="job-company-field">
              <Controller
                control={control}
                name="company"
                rules={{ validate: (value) => Boolean(value.trim()) || "Company is required." }}
                render={({ field }) => (
                  <Combobox
                    id="job-company"
                    value={field.value}
                    onInputValueChange={field.onChange}
                    onValueChange={(option) => field.onChange(option.label)}
                    options={companyOptions}
                    placeholder="e.g. Acme Corp"
                    state={errors.company ? "error" : "default"}
                    disabled={loading}
                  />
                )}
              />
            </div>
          </FormField>

          <FormField label="Job URLs" htmlFor="job-urls" error={errors.urlsText?.message}>
            <Input
              id="job-urls"
              placeholder="https://example.com/jobs/123"
              state={errors.urlsText ? "error" : "default"}
              disabled={loading}
              {...register("urlsText", {
                validate: (value) => {
                  const urls = value
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean);

                  return (
                    urls.every((url) => /^https?:\/\/.+/.test(url)) || "Each URL must start with http:// or https://"
                  );
                },
              })}
            />
          </FormField>

          <FormField label="Location" htmlFor="job-location">
            <Input id="job-location" placeholder="e.g. São Paulo, SP" disabled={loading} {...register("location")} />
          </FormField>

          <FormField label="Work region" htmlFor="job-work-region">
            <Input
              id="job-work-region"
              placeholder="e.g. Brazil, Latam, Anywhere"
              disabled={loading}
              {...register("workRegion")}
            />
          </FormField>
        </Stack>
      </form>

      <Stack direction="row" gap="xs" justify="end" className={cn("mt-4")}>
        <Button intent="secondary" size="md" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" form={formId} intent="primary" size="md" state={loading ? "loading" : "default"}>
          {isEdit ? "Save changes" : "Create"}
        </Button>
      </Stack>
    </>
  );
}

export interface JobQuickEditDialogProps {
  control?: DialogControl;
  trigger?: ReactElement;
  job?: JobValues;
  loading: boolean;
  dismissible?: boolean;
  onCreate?: (input: JobQuickEditInput) => Promise<boolean>;
  onUpdate?: (jobId: string, input: JobQuickEditInput) => Promise<boolean>;
}

export function JobQuickEditDialog({
  control: controlProp,
  trigger,
  job,
  loading,
  dismissible,
  onCreate,
  onUpdate,
}: JobQuickEditDialogProps) {
  const internalControl = useDialog();
  const control = controlProp ?? internalControl;
  const isEdit = Boolean(job);

  return (
    <Dialog
      trigger={trigger}
      title={isEdit ? "Edit job" : "New job"}
      description={
        isEdit
          ? "Update core job details like title, company, and URLs."
          : "Add a new job with a title, company, and optional URLs."
      }
      open={control.isOpen}
      onOpenChange={control.onOpenChange}
      dismissible={dismissible}
    >
      {control.isOpen ? (
        <JobQuickEditDialogForm
          isEdit={isEdit}
          job={job}
          loading={loading}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onClose={() => control.onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}
