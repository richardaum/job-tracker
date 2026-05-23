"use client";

import {
  Button,
  cn,
  CurrencyCombobox,
  Dialog,
  FormField,
  Input,
  Select,
  type SelectOption,
  Stack,
  useDialog,
} from "@job-tracker/ui";
import { type DialogControl } from "@job-tracker/ui";
import React, { useEffect, useRef, useState } from "react";
import { NumericFormat } from "react-number-format";

import {
  JobDocument,
  JobsDocument,
  SalaryPeriod,
  useUpdateJobMutation,
} from "@/gql/hooks";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";
import {
  centsToMajorInput,
  iso4217MaxFractionDigits,
  majorToCents,
  SALARY_PERIODS,
} from "@/modules/jobs/shared/utils/salaryFormat";

const defaultSalaryCurrency = "USD";

const periodNone = "__salary_none__";
const periodOptions: SelectOption[] = [
  { value: periodNone, label: "Not set" },
  ...SALARY_PERIODS.map((o) => ({ value: o.value, label: o.label })),
];

type DraftSalary = {
  salaryMinCents: number | null;
  salaryMaxCents: number | null;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod | null;
};

type SalaryEditDialogJobProps = {
  control?: DialogControl;
  trigger?: React.ReactElement;
  job: JobDetailsValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
};

type SalaryEditDialogDraftProps = {
  control: DialogControl;
  mode: "draft";
  salaryDraft: DraftSalary;
  onSalarySave: (next: {
    salaryMinCents: number | null;
    salaryMaxCents: number | null;
    salaryCurrency: string | null;
    salaryPeriod: SalaryPeriod | null;
  }) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  idPrefix?: string;
};

export type SalaryEditDialogProps =
  | SalaryEditDialogJobProps
  | SalaryEditDialogDraftProps;

function isDraftProps(
  p: SalaryEditDialogProps,
): p is SalaryEditDialogDraftProps {
  return "mode" in p && p.mode === "draft";
}

export function SalaryEditDialog(props: SalaryEditDialogProps) {
  const isDraft = isDraftProps(props);
  const internalControl = useDialog();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: defaultSalaryCurrency,
    salaryPeriod: "",
  });
  const [error, setError] = useState<string | undefined>();

  const [update] = useUpdateJobMutation({
    refetchQueries: isDraft
      ? []
      : [
          {
            query: JobDocument,
            variables: { id: (props as SalaryEditDialogJobProps).job.id },
          },
          { query: JobsDocument },
        ],
  });

  const control = isDraft ? props.control : (props.control ?? internalControl);
  const trigger = isDraft ? undefined : props.trigger;
  const disabledInputs = isDraft ? Boolean(props.disabled) : false;
  const idPrefix = isDraft ? (props.idPrefix ?? "ai-draft-sal") : "ov-sal";
  const amountDecimalScale = iso4217MaxFractionDigits(form.salaryCurrency);

  function syncFromJob(job: JobDetailsValues) {
    const s = job.salary;
    const cur = s.currency?.trim().toUpperCase() || defaultSalaryCurrency;
    setForm({
      salaryMin: centsToMajorInput(s.minCents),
      salaryMax: centsToMajorInput(s.maxCents),
      salaryCurrency: cur,
      salaryPeriod: s.period ? String(s.period) : "",
    });
    setError(undefined);
  }

  function syncFromDraft(c: DraftSalary) {
    const cur = c.salaryCurrency?.trim().toUpperCase() || defaultSalaryCurrency;
    setForm({
      salaryMin: centsToMajorInput(c.salaryMinCents),
      salaryMax: centsToMajorInput(c.salaryMaxCents),
      salaryCurrency: cur,
      salaryPeriod: c.salaryPeriod ? String(c.salaryPeriod) : "",
    });
    setError(undefined);
  }

  const wasDraftDialogOpen = useRef(false);
  useEffect(() => {
    if (!isDraftProps(props)) {
      wasDraftDialogOpen.current = false;
      return;
    }
    if (control.isOpen && !wasDraftDialogOpen.current) {
      syncFromDraft(props.salaryDraft);
    }
    wasDraftDialogOpen.current = control.isOpen;
  });

  function handleOpenChange(next: boolean) {
    control.onOpenChange(next);
    if (!isDraft && next) {
      syncFromJob(props.job);
    }
  }

  function validate(): boolean {
    const minC = majorToCents(form.salaryMin);
    const maxC = majorToCents(form.salaryMax);
    const rawCur = form.salaryCurrency.trim().toUpperCase();
    const hasAmount = minC != null || maxC != null;
    if (hasAmount) {
      const cur = /^[A-Z]{3}$/.test(rawCur) ? rawCur : defaultSalaryCurrency;
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
    } else if (rawCur.length > 0 || form.salaryPeriod.length > 0) {
      setError("Remove currency and period, or add a min/max amount.");
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
    const rawCur = form.salaryCurrency.trim().toUpperCase();
    const periodVal = form.salaryPeriod
      ? (form.salaryPeriod as SalaryPeriod)
      : null;
    const hasAmount = minC != null || maxC != null;
    const salaryCurrency = !hasAmount
      ? null
      : /^[A-Z]{3}$/.test(rawCur)
        ? rawCur
        : defaultSalaryCurrency;
    const payload = {
      salaryMinCents: hasAmount ? minC : null,
      salaryMaxCents: hasAmount ? maxC : null,
      salaryCurrency,
      salaryPeriod: hasAmount && periodVal ? periodVal : null,
    };

    try {
      if (isDraft) {
        props.onSalarySave(payload);
        control.close();
        return;
      }
      await update({
        variables: {
          id: props.job.id,
          input: {
            salaryMinCents: payload.salaryMinCents,
            salaryMaxCents: payload.salaryMaxCents,
            salaryCurrency: payload.salaryCurrency,
            salaryPeriod: payload.salaryPeriod,
          },
        },
      });
      props.onSuccess?.("Salary updated.");
      control.close();
    } catch {
      if (isDraft) {
        props.onError?.("Could not update salary.");
      } else {
        (props as SalaryEditDialogJobProps).onError?.(
          "Could not update salary.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      trigger={trigger}
      title="Edit salary"
      open={control.isOpen}
      onOpenChange={handleOpenChange}
    >
      <Stack gap="sm">
        <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2")}>
          <FormField label="Minimum" htmlFor={`${idPrefix}-min`}>
            <NumericFormat
              customInput={Input}
              id={`${idPrefix}-min`}
              inputMode="decimal"
              allowNegative={false}
              thousandSeparator=","
              decimalSeparator="."
              decimalScale={amountDecimalScale}
              fixedDecimalScale={false}
              value={form.salaryMin}
              valueIsNumericString
              onValueChange={(vals) =>
                setForm((f) => ({ ...f, salaryMin: vals.value }))
              }
              disabled={saving || disabledInputs}
            />
          </FormField>
          <FormField label="Maximum" htmlFor={`${idPrefix}-max`}>
            <NumericFormat
              customInput={Input}
              id={`${idPrefix}-max`}
              inputMode="decimal"
              allowNegative={false}
              thousandSeparator=","
              decimalSeparator="."
              decimalScale={amountDecimalScale}
              fixedDecimalScale={false}
              value={form.salaryMax}
              valueIsNumericString
              onValueChange={(vals) =>
                setForm((f) => ({ ...f, salaryMax: vals.value }))
              }
              disabled={saving || disabledInputs}
            />
          </FormField>
        </div>
        <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2")}>
          <FormField
            label="Currency"
            htmlFor={`${idPrefix}-cur`}
            required
            error={error}
          >
            <CurrencyCombobox
              id={`${idPrefix}-cur`}
              value={form.salaryCurrency}
              onValueChange={(salaryCurrency) =>
                setForm((f) => ({ ...f, salaryCurrency }))
              }
              disabled={saving || disabledInputs}
              placeholder={defaultSalaryCurrency}
            />
          </FormField>
          <FormField label="Pay period" htmlFor={`${idPrefix}-period`} required>
            <Select
              name={`${idPrefix}-period`}
              options={periodOptions}
              value={form.salaryPeriod ? form.salaryPeriod : periodNone}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  salaryPeriod: v === periodNone ? "" : v,
                }))
              }
              disabled={saving || disabledInputs}
              size="md"
            />
          </FormField>
        </div>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            onClick={() => void handleSave()}
            state={saving ? "loading" : "default"}
            disabled={disabledInputs}
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}
