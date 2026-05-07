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
} from "@job-tracker/ui";
import React, { useEffect, useRef, useState } from "react";
import { NumericFormat } from "react-number-format";

import {
  ApplicationDocument,
  ApplicationsDocument,
  SalaryPeriod,
  useUpdateApplicationMutation,
} from "@/gql/hooks";
import type { ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";
import {
  centsToMajorInput,
  iso4217MaxFractionDigits,
  majorToCents,
  SALARY_PERIODS,
} from "@/modules/applications/shared/utils/salaryFormat";

import { FieldEditTriggerButton } from "./FieldEditTriggerButton";

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

type SalaryEditDialogApplicationProps = {
  application: ApplicationDetailsValues;
  trigger?: React.ReactElement;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
};

type SalaryEditDialogDraftProps = {
  mode: "draft";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Hidden trigger when opened programmatically; defaults to a hidden span. */
  trigger?: React.ReactElement;
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
  | SalaryEditDialogApplicationProps
  | SalaryEditDialogDraftProps;

function isDraftProps(
  p: SalaryEditDialogProps,
): p is SalaryEditDialogDraftProps {
  return "mode" in p && p.mode === "draft";
}

export function SalaryEditDialog(props: SalaryEditDialogProps) {
  const isDraft = isDraftProps(props);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: defaultSalaryCurrency,
    salaryPeriod: "",
  });
  const [error, setError] = useState<string | undefined>();

  const [update] = useUpdateApplicationMutation({
    refetchQueries: isDraft
      ? []
      : [
          {
            query: ApplicationDocument,
            variables: {
              id: (props as SalaryEditDialogApplicationProps).application.id,
            },
          },
          { query: ApplicationsDocument },
        ],
  });

  const open = isDraft ? props.open : applicationOpen;
  const disabledInputs = isDraft ? Boolean(props.disabled) : false;
  const idPrefix = isDraft ? (props.idPrefix ?? "ai-draft-sal") : "ov-sal";
  const amountDecimalScale = iso4217MaxFractionDigits(form.salaryCurrency);

  function syncFromApplication(application: ApplicationDetailsValues) {
    const s = application.salary;
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
    if (props.open && !wasDraftDialogOpen.current) {
      syncFromDraft(props.salaryDraft);
    }
    wasDraftDialogOpen.current = props.open;
  });

  function handleOpenChange(next: boolean) {
    if (isDraft) {
      props.onOpenChange(next);
    } else {
      setApplicationOpen(next);
      if (next) {
        syncFromApplication(props.application);
      }
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
        props.onOpenChange(false);
        return;
      }
      await update({
        variables: {
          id: props.application.id,
          input: {
            salaryMinCents: payload.salaryMinCents,
            salaryMaxCents: payload.salaryMaxCents,
            salaryCurrency: payload.salaryCurrency,
            salaryPeriod: payload.salaryPeriod,
          },
        },
      });
      props.onSuccess?.("Salary updated.");
      setApplicationOpen(false);
    } catch {
      if (isDraft) {
        props.onError?.("Could not update salary.");
      } else {
        (props as SalaryEditDialogApplicationProps).onError?.(
          "Could not update salary.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      title="Edit salary"
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        isDraft
          ? (props.trigger ?? <span aria-hidden style={{ display: "none" }} />)
          : (props.trigger ?? <FieldEditTriggerButton label="Edit salary" />)
      }
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
            size="sm"
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
