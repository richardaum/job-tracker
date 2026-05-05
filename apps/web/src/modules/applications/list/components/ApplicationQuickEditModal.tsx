"use client";

import {
  Button,
  cn,
  Combobox,
  Dialog,
  FormField,
  Input,
  Stack,
} from "@job-tracker/ui";
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
}

interface FormState {
  title: string;
  company: string;
  urlsText: string;
}

interface ApplicationQuickEditModalFormProps {
  isEdit: boolean;
  application?: ApplicationValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onCreated?: (applicationId: string) => void;
  onClose: () => void;
}

function ApplicationQuickEditModalForm({
  isEdit,
  application,
  onSuccess,
  onError,
  onCreated,
  onClose,
}: ApplicationQuickEditModalFormProps) {
  const [form, setForm] = useState<FormState>({
    title: application?.title ?? "",
    company: application?.company ?? "",
    urlsText: (application?.urls ?? []).join("\n"),
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

  function setCompany(value: string) {
    setForm((f) => ({ ...f, company: value }));
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
    };

    try {
      if (isEdit && application) {
        await updateApplication({ variables: { id: application.id, input } });
        onSuccess?.("Application updated.");
      } else {
        const result = await createApplication({ variables: { input } });
        const createdApplicationId = result.data?.createApplication.id;
        onSuccess?.("Application created.");
        if (createdApplicationId) {
          onCreated?.(createdApplicationId);
        }
      }
      onClose();
    } catch {
      onError?.("Something went wrong. Please try again.");
    }
  }

  const formId = "application-quick-edit-modal-form";

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
              onValueChange={setCompany}
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
              placeholder={
                "https://example.com/jobs/123\nhttps://company.com/careers/role"
              }
              state={errors.urlsText ? "error" : "default"}
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
          form={formId}
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

export interface ApplicationQuickEditModalProps {
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  application?: ApplicationValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onCreated?: (applicationId: string) => void;
}

export function ApplicationQuickEditModal({
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  application,
  onSuccess,
  onError,
  onCreated,
}: ApplicationQuickEditModalProps) {
  const isEdit = Boolean(application);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;

  function handleOpenChange(open: boolean) {
    setInternalOpen(open);
    externalOnOpenChange?.(open);
  }

  return (
    <Dialog
      trigger={trigger ?? <button type="button" className="hidden" />}
      title={isEdit ? "Edit application" : "New application"}
      description={
        isEdit
          ? "Update core application details like title, company, and URLs."
          : "Add a new application with a title, company, and optional URLs."
      }
      open={open}
      onOpenChange={handleOpenChange}
    >
      {open ? (
        <ApplicationQuickEditModalForm
          isEdit={isEdit}
          application={application}
          onSuccess={onSuccess}
          onError={onError}
          onCreated={onCreated}
          onClose={() => handleOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}
