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
  ApplicationsDocument,
  useCompaniesQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
} from "@/gql/hooks";

interface ApplicationValues {
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

interface ApplicationQuickEditDialogFormProps {
  isEdit: boolean;
  application?: ApplicationValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onCreated?: (applicationId: string) => void;
  onClose: () => void;
}

function ApplicationQuickEditDialogForm({
  isEdit,
  application,
  onSuccess,
  onError,
  onCreated,
  onClose,
}: ApplicationQuickEditDialogFormProps) {
  const [form, setForm] = useState<FormState>({
    title: application?.title ?? "",
    company: application?.company ?? "",
    urlsText: (application?.urls ?? []).join("\n"),
    location: application?.location ?? "",
    workRegion: application?.workRegion ?? "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const refetchQueries = [{ query: ApplicationsDocument }];
  const [createApplication, { loading: creating }] =
    useCreateApplicationMutation({ refetchQueries, awaitRefetchQueries: true });
  const [updateApplication, { loading: updating }] =
    useUpdateApplicationMutation({ refetchQueries, awaitRefetchQueries: true });
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

    if (isEdit && application) {
      const [error] = await tryRun(
        updateApplication({ variables: { id: application.id, input } }),
      );
      if (error) {
        onError?.("Something went wrong. Please try again.");
        return;
      }
      onSuccess?.("Application updated.");
      onClose();
      return;
    }

    const [error, result] = await tryRun(
      createApplication({ variables: { input } }),
    );
    if (error) {
      onError?.("Something went wrong. Please try again.");
      return;
    }
    const createdApplicationId = result.data?.createApplication.id;
    onSuccess?.("Application created.");
    if (createdApplicationId) {
      onCreated?.(createdApplicationId);
    }
    onClose();
  }

  const formId = "application-quick-edit-dialog-form";

  return (
    <>
      <form id={formId} onSubmit={handleSubmit} noValidate>
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
            <Combobox
              id="app-company"
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
            htmlFor="app-urls"
            error={errors.urlsText}
          >
            <Input
              id="app-urls"
              value={form.urlsText}
              onChange={set("urlsText")}
              placeholder="https://example.com/jobs/123"
              state={errors.urlsText ? "error" : "default"}
              disabled={loading}
            />
          </FormField>

          <FormField label="Location" htmlFor="app-location">
            <Input
              id="app-location"
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. São Paulo, SP"
              disabled={loading}
            />
          </FormField>

          <FormField label="Work region" htmlFor="app-work-region">
            <Input
              id="app-work-region"
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

export interface ApplicationQuickEditDialogProps {
  control: DialogControl;
  application?: ApplicationValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onCreated?: (applicationId: string) => void;
}

export function ApplicationQuickEditDialog({
  control,
  application,
  onSuccess,
  onError,
  onCreated,
}: ApplicationQuickEditDialogProps) {
  const isEdit = Boolean(application);

  return (
    <Dialog
      title={isEdit ? "Edit application" : "New application"}
      description={
        isEdit
          ? "Update core application details like title, company, and URLs."
          : "Add a new application with a title, company, and optional URLs."
      }
      open={control.isOpen}
      onOpenChange={control.onOpenChange}
    >
      {control.isOpen ? (
        <ApplicationQuickEditDialogForm
          isEdit={isEdit}
          application={application}
          onSuccess={onSuccess}
          onError={onError}
          onCreated={onCreated}
          onClose={() => control.onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}
