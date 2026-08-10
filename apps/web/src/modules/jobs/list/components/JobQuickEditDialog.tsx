"use client";

import { Button, cn, Combobox, Dialog, FormField, Input, Stack, useDialog } from "@job-tracker/ui";
import { type DialogControl } from "@job-tracker/ui";
import { Controller, useForm } from "react-hook-form";
import { useCallback, useEffect, useImperativeHandle, useRef } from "react";
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
type JobQuickEditRestrictedTarget = JobQuickEditField | "create";

export interface JobQuickEditDialogHandle {
  focusField: (field: JobQuickEditField) => void;
  submit: () => void;
}

export interface JobQuickEditFormValues {
  title: string;
  company: string;
}

export interface JobQuickEditFormChange {
  name: string;
  values: JobQuickEditFormValues;
}

export interface JobQuickEditInput {
  title: string;
  company: string;
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
  restrictInteractionTo?: JobQuickEditRestrictedTarget;
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
  restrictInteractionTo,
  dialogRef,
  onClose,
}: JobQuickEditDialogFormProps) {
  const {
    control,
    handleSubmit,
    register,
    subscribe,
    formState: { errors },
  } = useForm<JobQuickEditFormValues>({ defaultValues: { title: job?.title ?? "", company: job?.company ?? "" } });

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

  const handleValidSubmit = useCallback(
    async (form: JobQuickEditFormValues) => {
      const input = { title: form.title.trim(), company: form.company.trim() };

      const didSubmit = job ? await onUpdate?.(job.id, input) : await onCreate?.(input);
      if (didSubmit) onClose();
    },
    [job, onUpdate, onCreate, onClose],
  );

  useImperativeHandle(
    dialogRef,
    () => ({
      focusField: (field) => {
        if (field === "title") titleInputRef.current?.focus();
        if (field === "company") companyInputRef.current?.focus();
      },
      submit: () => void handleSubmit(handleValidSubmit)(),
    }),
    [handleSubmit, handleValidSubmit],
  );

  function handleFormSubmit(event: SubmitEvent<HTMLFormElement>) {
    void handleSubmit(handleValidSubmit)(event);
  }

  function handleFormKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (disableSubmitOnEnter && event.key === "Enter") event.preventDefault();
  }

  const formId = "job-quick-edit-dialog-form";

  return (
    <>
      <form id={formId} onSubmit={handleFormSubmit} onKeyDown={handleFormKeyDown} noValidate>
        <Stack gap="sm">
          <div inert={restrictInteractionTo === "company" || restrictInteractionTo === "create"}>
            <FormField label="Job title" htmlFor="job-title" required error={errors.title?.message}>
              <Input
                id="job-title"
                data-welcome-tour-step="job-title-input"
                autoComplete="off"
                placeholder="e.g. Senior Frontend Engineer"
                state={errors.title ? "error" : "default"}
                disabled={loading}
                {...titleInputProps}
                tabIndex={restrictInteractionTo !== undefined && restrictInteractionTo !== "title" ? -1 : undefined}
                ref={(element) => {
                  titleInputRef.current = element;
                  registerTitleRef(element);
                }}
              />
            </FormField>
          </div>

          <div inert={restrictInteractionTo === "title" || restrictInteractionTo === "create"}>
            <FormField label="Company" htmlFor="job-company" required error={errors.company?.message}>
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
                    inputProps={{
                      "data-welcome-tour-step": "job-company-input",
                      tabIndex:
                        restrictInteractionTo !== undefined && restrictInteractionTo !== "company" ? -1 : undefined,
                    }}
                    options={disableCompanyOptions ? [] : companyOptions}
                    placeholder="e.g. Acme Corp"
                    state={errors.company ? "error" : "default"}
                    disabled={loading}
                  />
                )}
              />
            </FormField>
          </div>
        </Stack>
      </form>

      <Stack direction="row" gap="xs" justify="end" className={cn("mt-4")}>
        <div inert={restrictInteractionTo !== undefined}>
          <Button
            intent="secondary"
            size="md"
            onClick={onClose}
            disabled={loading}
            tabIndex={restrictInteractionTo === undefined ? undefined : -1}
          >
            Cancel
          </Button>
        </div>
        <div inert={restrictInteractionTo !== undefined && restrictInteractionTo !== "create"}>
          <Button
            type="submit"
            form={formId}
            intent="primary"
            size="md"
            state={loading ? "loading" : "default"}
            tabIndex={restrictInteractionTo !== undefined && restrictInteractionTo !== "create" ? -1 : undefined}
            data-welcome-tour-step="create-job-button"
          >
            {isEdit ? "Save changes" : "Create"}
          </Button>
        </div>
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
  restrictInteractionTo?: JobQuickEditRestrictedTarget;
  onContentElementChange?: (element: HTMLDivElement | null) => void;
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
  restrictInteractionTo,
  onContentElementChange,
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
      description={isEdit ? "Update the title and company for this job." : "Add a new job with a title and company."}
      open={control.isOpen}
      onOpenChange={control.onOpenChange}
      onContentElementChange={onContentElementChange}
      dismissible={dismissible}
      contentClassName={cn("inset-0 m-auto h-fit translate-none")}
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
          restrictInteractionTo={restrictInteractionTo}
          dialogRef={ref}
          onClose={() => control.onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}
