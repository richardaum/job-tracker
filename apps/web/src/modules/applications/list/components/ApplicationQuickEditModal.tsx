"use client";

import React, { useState } from "react";
import {
  Button,
  Combobox,
  Dialog,
  FormField,
  Input,
  Stack,
  cn,
} from "@job-tracker/ui";
import {
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useCompaniesQuery,
  ApplicationsDocument,
} from "@/gql/hooks";

interface ApplicationValues {
  id: string;
  title: string;
  company: string;
  url?: string | null;
}

interface FormState {
  title: string;
  company: string;
  url: string;
}

interface ApplicationQuickEditModalFormProps {
  isEdit: boolean;
  application?: ApplicationValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onClose: () => void;
}

function ApplicationQuickEditModalForm({
  isEdit,
  application,
  onSuccess,
  onError,
  onClose,
}: ApplicationQuickEditModalFormProps) {
  const [form, setForm] = useState<FormState>({
    title: application?.title ?? "",
    company: application?.company ?? "",
    url: application?.url ?? "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const refetchQueries = [{ query: ApplicationsDocument }];
  const [createApplication, { loading: creating }] =
    useCreateApplicationMutation({ refetchQueries });
  const [updateApplication, { loading: updating }] =
    useUpdateApplicationMutation({ refetchQueries });
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
    };

    try {
      if (isEdit && application) {
        await updateApplication({
          variables: { id: application.id, input },
        });
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

          <FormField label="Job URL" htmlFor="app-url" error={errors.url}>
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
  trigger: React.ReactElement;
  application?: ApplicationValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function ApplicationQuickEditModal({
  trigger,
  application,
  onSuccess,
  onError,
}: ApplicationQuickEditModalProps) {
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
        <ApplicationQuickEditModalForm
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
