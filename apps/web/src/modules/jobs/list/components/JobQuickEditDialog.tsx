"use client";

import { Button, cn, Combobox, Dialog, FormField, Input, Stack, useDialog } from "@job-tracker/ui";
import { type DialogControl } from "@job-tracker/ui";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useImperativeHandle, useRef } from "react";
import type { KeyboardEvent, ReactElement, Ref, SubmitEvent } from "react";

import { useCompaniesQuery } from "@/gql/hooks";

interface JobValues {
  id: string;
  title: string;
  company: string;
  urls: string[];
  location?: string | null;
  workRegion?: string | null;
}

export type JobQuickEditField = "title" | "company";

export interface JobQuickEditDialogHandle {
  focusField: (field: JobQuickEditField) => void;
}

export interface JobQuickEditFormValues {
  title: string;
  company: string;
  urlsText: string;
  location: string;
  workRegion: string;
}

export interface JobQuickEditFormChange {
  name: string;
  values: JobQuickEditFormValues;
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
  onFormChange?: (change: JobQuickEditFormChange) => void;
  disableSubmitOnEnter: boolean;
  disableCompanyOptions: boolean;
  dialogRef?: Ref<JobQuickEditDialogHandle>;
  onClose: () => void;
}

function JobQuickEditDialogForm({
  isEdit,
  job,
  loading,
  onCreate,
  onUpdate,
  onFormChange,
  disableSubmitOnEnter,
  disableCompanyOptions,
  dialogRef,
  onClose,
}: JobQuickEditDialogFormProps) {
  const {
    control,
    handleSubmit,
    register,
    subscribe,
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

  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ name, values }) => {
          if (!name) return;

          onFormChange?.({ name, values });
        },
      }),
    [onFormChange, subscribe],
  );

  const { data: companiesData } = useCompaniesQuery();
  const companyOptions = (companiesData?.companies ?? []).map((c) => ({ label: c.name, value: c.id }));
  const titleInputRef = useRef<HTMLInputElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const { ref: registerTitleRef, ...titleInputProps } = register("title", {
    validate: (value) => Boolean(value.trim()) || "Title is required.",
  });

  useImperativeHandle(
    dialogRef,
    () => ({
      focusField: (field) => {
        if (field === "title") titleInputRef.current?.focus();
        if (field === "company") companyInputRef.current?.focus();
      },
    }),
    [],
  );

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

  function handleFormSubmit(event: SubmitEvent<HTMLFormElement>) {
    void handleSubmit(submit)(event);
  }

  function handleFormKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (disableSubmitOnEnter && event.key === "Enter") event.preventDefault();
  }

  const formId = "job-quick-edit-dialog-form";

  return (
    <>
      <form id={formId} onSubmit={handleFormSubmit} onKeyDown={handleFormKeyDown} noValidate>
        <Stack gap="sm">
          <FormField label="Job title" htmlFor="job-title" required error={errors.title?.message}>
            <Input
              id="job-title"
              data-onboarding-step="job-title-input"
              autoComplete="off"
              placeholder="e.g. Senior Frontend Engineer"
              state={errors.title ? "error" : "default"}
              disabled={loading}
              {...titleInputProps}
              ref={(element) => {
                titleInputRef.current = element;
                registerTitleRef(element);
              }}
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
                    onInputElementChange={(element) => {
                      companyInputRef.current = element;
                    }}
                    options={disableCompanyOptions ? [] : companyOptions}
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
  ref?: Ref<JobQuickEditDialogHandle>;
  control?: DialogControl;
  trigger?: ReactElement;
  job?: JobValues;
  loading: boolean;
  dismissible?: boolean;
  disableSubmitOnEnter?: boolean;
  disableCompanyOptions?: boolean;
  onCreate?: (input: JobQuickEditInput) => Promise<boolean>;
  onUpdate?: (jobId: string, input: JobQuickEditInput) => Promise<boolean>;
  onFormChange?: (change: JobQuickEditFormChange) => void;
}

export function JobQuickEditDialog({
  ref,
  control: controlProp,
  trigger,
  job,
  loading,
  dismissible,
  disableSubmitOnEnter = false,
  disableCompanyOptions = false,
  onCreate,
  onUpdate,
  onFormChange,
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
          onFormChange={onFormChange}
          disableSubmitOnEnter={disableSubmitOnEnter}
          disableCompanyOptions={disableCompanyOptions}
          dialogRef={ref}
          onClose={() => control.onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}
