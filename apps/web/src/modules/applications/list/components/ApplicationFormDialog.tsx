"use client";

import React, { useState } from "react";
import {
  Button,
  Dialog,
  FormField,
  Input,
  Stack,
  Text,
  cn,
} from "@job-tracker/ui";
import {
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  ApplicationsDocument,
  SalaryPeriod,
} from "@/gql/hooks";
import { Select, type SelectOption } from "@job-tracker/ui";
import {
  centsToMajorInput,
  majorToCents,
  parseTagInput,
  SALARY_PERIODS,
} from "@/modules/applications/shared/utils/compensationFormat";

interface ApplicationValues {
  id: string;
  title: string;
  company: string;
  url?: string | null;
  salaryMinCents?: number | null;
  salaryMaxCents?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: SalaryPeriod | null;
  salaryTags?: string[];
}

interface FormState {
  title: string;
  company: string;
  url: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryPeriod: string;
  salaryTags: string;
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
    salaryMin: centsToMajorInput(application?.salaryMinCents),
    salaryMax: centsToMajorInput(application?.salaryMaxCents),
    salaryCurrency: application?.salaryCurrency ?? "",
    salaryPeriod: application?.salaryPeriod
      ? String(application.salaryPeriod)
      : "",
    salaryTags: (application?.salaryTags ?? []).join(", "),
  });
  const [errors, setErrors] = useState<
    Partial<FormState & { compensation: string }>
  >({});

  const refetchQueries = [{ query: ApplicationsDocument }];
  const [createApplication, { loading: creating }] =
    useCreateApplicationMutation({ refetchQueries });
  const [updateApplication, { loading: updating }] =
    useUpdateApplicationMutation({ refetchQueries });
  const loading = creating || updating;

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  const periodNone = "__comp_none__";
  const periodOptions: SelectOption[] = [
    { value: periodNone, label: "Not set" },
    ...SALARY_PERIODS.map((o) => ({
      value: o.value,
      label: o.label,
    })),
  ];

  function validate(): boolean {
    const next: Partial<FormState & { compensation: string }> = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.company.trim()) next.company = "Company is required.";
    if (form.url && !/^https?:\/\/.+/.test(form.url))
      next.url = "URL must start with http:// or https://";
    const minC = majorToCents(form.salaryMin);
    const maxC = majorToCents(form.salaryMax);
    const cur = form.salaryCurrency.trim().toUpperCase();
    const hasAmount = minC != null || maxC != null;
    if (hasAmount) {
      if (!/^[A-Z]{3}$/.test(cur)) {
        next.compensation = "Use a 3-letter currency code (e.g. BRL, USD).";
      } else if (!form.salaryPeriod) {
        next.compensation = "Select pay period for the salary range.";
      } else if (minC != null && maxC != null && minC > maxC) {
        next.compensation = "Minimum must be less than or equal to maximum.";
      }
    } else if (cur.length > 0 || form.salaryPeriod.length > 0) {
      next.compensation =
        "Remove currency and period, or add a min/max amount in major units.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const minC = majorToCents(form.salaryMin);
    const maxC = majorToCents(form.salaryMax);
    const cur = form.salaryCurrency.trim().toUpperCase();
    const periodVal = form.salaryPeriod
      ? (form.salaryPeriod as SalaryPeriod)
      : null;
    const tagList = parseTagInput(form.salaryTags);
    const hasAmount = minC != null || maxC != null;

    const input = {
      title: form.title.trim(),
      company: form.company.trim(),
      url: form.url.trim() || null,
      salaryMinCents: hasAmount ? minC : null,
      salaryMaxCents: hasAmount ? maxC : null,
      salaryCurrency: hasAmount && cur ? cur : null,
      salaryPeriod: hasAmount && periodVal ? periodVal : null,
      salaryTags: tagList,
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

          <Text size="sm" weight="semibold" className={cn("pt-1")}>
            Compensation (optional)
          </Text>
          <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2")}>
            <FormField
              label="Min (major units)"
              htmlFor="app-sal-min"
              hint="e.g. 100000.50"
            >
              <Input
                id="app-sal-min"
                inputMode="decimal"
                value={form.salaryMin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, salaryMin: e.target.value }))
                }
                disabled={loading}
                placeholder="0"
              />
            </FormField>
            <FormField
              label="Max (major units)"
              htmlFor="app-sal-max"
              hint="Leave empty for single value / open max"
            >
              <Input
                id="app-sal-max"
                inputMode="decimal"
                value={form.salaryMax}
                onChange={(e) =>
                  setForm((f) => ({ ...f, salaryMax: e.target.value }))
                }
                disabled={loading}
                placeholder="0"
              />
            </FormField>
          </div>
          <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2")}>
            <FormField label="Currency" htmlFor="app-sal-cur" hint="ISO 4217">
              <Input
                id="app-sal-cur"
                value={form.salaryCurrency}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    salaryCurrency: e.target.value.toUpperCase().slice(0, 3),
                  }))
                }
                placeholder="BRL"
                maxLength={3}
                disabled={loading}
              />
            </FormField>
            <FormField label="Pay period" htmlFor="app-sal-period">
              <Select
                name="app-sal-period"
                options={periodOptions}
                value={form.salaryPeriod ? form.salaryPeriod : periodNone}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    salaryPeriod: v === periodNone ? "" : v,
                  }))
                }
                placeholder="Not set"
                disabled={loading}
                size="md"
              />
            </FormField>
          </div>
          <FormField
            label="Tags"
            htmlFor="app-sal-tags"
            hint="Comma-separated (e.g. Equity, CLT, Bonus)"
            error={errors.compensation}
          >
            <Input
              id="app-sal-tags"
              value={form.salaryTags}
              onChange={(e) =>
                setForm((f) => ({ ...f, salaryTags: e.target.value }))
              }
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
