"use client";

import React, { useState } from "react";
import {
  Button,
  Dialog,
  FormField,
  Input,
  Select,
  Stack,
  Text,
  type SelectOption,
  cn,
} from "@job-tracker/ui";
import {
  ApplicationDocument,
  ApplicationsDocument,
  SalaryPeriod,
  useUpdateApplicationMutation,
} from "@/gql/hooks";
import {
  centsToMajorInput,
  majorToCents,
  SALARY_PERIODS,
} from "@/modules/applications/shared/utils/compensationFormat";
import { FieldEditTriggerButton } from "./HoverEditableFieldRow";
import type { ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";

const periodNone = "__comp_none__";
const periodOptions: SelectOption[] = [
  { value: periodNone, label: "Not set" },
  ...SALARY_PERIODS.map((o) => ({ value: o.value, label: o.label })),
];

export function CompensationEditDialog({
  application,
  onSuccess,
  onError,
}: {
  application: ApplicationDetailsValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "",
    salaryPeriod: "",
  });
  const [error, setError] = useState<string | undefined>();

  const [update] = useUpdateApplicationMutation({
    refetchQueries: [
      { query: ApplicationDocument, variables: { id: application.id } },
      { query: ApplicationsDocument },
    ],
  });

  function syncFromApp() {
    setForm({
      salaryMin: centsToMajorInput(application.salaryMinCents),
      salaryMax: centsToMajorInput(application.salaryMaxCents),
      salaryCurrency: application.salaryCurrency ?? "",
      salaryPeriod: application.salaryPeriod
        ? String(application.salaryPeriod)
        : "",
    });
    setError(undefined);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) syncFromApp();
  }

  function validate(): boolean {
    const minC = majorToCents(form.salaryMin);
    const maxC = majorToCents(form.salaryMax);
    const cur = form.salaryCurrency.trim().toUpperCase();
    const hasAmount = minC != null || maxC != null;
    if (hasAmount) {
      if (!/^[A-Z]{3}$/.test(cur)) {
        setError("Use a 3-letter currency code (e.g. BRL, USD).");
        return false;
      }
      if (!form.salaryPeriod) {
        setError("Select pay period for the salary range.");
        return false;
      }
      if (minC != null && maxC != null && minC > maxC) {
        setError("Minimum must be less than or equal to maximum.");
        return false;
      }
    } else if (cur.length > 0 || form.salaryPeriod.length > 0) {
      setError(
        "Remove currency and period, or add a min/max amount in major units.",
      );
      return false;
    }
    setError(undefined);
    return true;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const minC = majorToCents(form.salaryMin);
    const maxC = majorToCents(form.salaryMax);
    const cur = form.salaryCurrency.trim().toUpperCase();
    const periodVal = form.salaryPeriod
      ? (form.salaryPeriod as SalaryPeriod)
      : null;
    const hasAmount = minC != null || maxC != null;
    try {
      await update({
        variables: {
          id: application.id,
          input: {
            salaryMinCents: hasAmount ? minC : null,
            salaryMaxCents: hasAmount ? maxC : null,
            salaryCurrency: hasAmount && cur ? cur : null,
            salaryPeriod: hasAmount && periodVal ? periodVal : null,
          },
        },
      });
      onSuccess?.("Compensation updated.");
      setOpen(false);
    } catch {
      onError?.("Could not update compensation.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      title="Edit compensation"
      open={open}
      onOpenChange={handleOpenChange}
      trigger={<FieldEditTriggerButton label="Edit compensation" />}
    >
      <Stack gap="sm">
        <Text size="sm" color="secondary">
          Optional salary range, currency, and pay period.
        </Text>
        <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2")}>
          <FormField
            label="Min (major units)"
            htmlFor="ov-sal-min"
            hint="e.g. 100000.50"
          >
            <Input
              id="ov-sal-min"
              inputMode="decimal"
              value={form.salaryMin}
              onChange={(e) =>
                setForm((f) => ({ ...f, salaryMin: e.target.value }))
              }
              disabled={saving}
            />
          </FormField>
          <FormField
            label="Max (major units)"
            htmlFor="ov-sal-max"
            hint="Optional upper bound"
          >
            <Input
              id="ov-sal-max"
              inputMode="decimal"
              value={form.salaryMax}
              onChange={(e) =>
                setForm((f) => ({ ...f, salaryMax: e.target.value }))
              }
              disabled={saving}
            />
          </FormField>
        </div>
        <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2")}>
          <FormField
            label="Currency"
            htmlFor="ov-sal-cur"
            hint="ISO 4217"
            error={error}
          >
            <Input
              id="ov-sal-cur"
              value={form.salaryCurrency}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  salaryCurrency: e.target.value.toUpperCase().slice(0, 3),
                }))
              }
              maxLength={3}
              disabled={saving}
              placeholder="BRL"
            />
          </FormField>
          <FormField label="Pay period" htmlFor="ov-sal-period">
            <Select
              name="ov-sal-period"
              options={periodOptions}
              value={form.salaryPeriod ? form.salaryPeriod : periodNone}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  salaryPeriod: v === periodNone ? "" : v,
                }))
              }
              disabled={saving}
              size="md"
            />
          </FormField>
        </div>
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
