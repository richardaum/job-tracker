"use client";

import React, { useEffect, useRef, useState } from "react";
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

type DraftCompensation = {
  salaryMinCents: number | null;
  salaryMaxCents: number | null;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod | null;
};

type CompensationEditDialogApplicationProps = {
  application: ApplicationDetailsValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
};

type CompensationEditDialogDraftProps = {
  mode: "draft";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Hidden trigger when opened programmatically; defaults to a hidden span. */
  trigger?: React.ReactElement;
  compensation: DraftCompensation;
  onCompensationSave: (next: {
    salaryMinCents: number | null;
    salaryMaxCents: number | null;
    salaryCurrency: string | null;
    salaryPeriod: SalaryPeriod | null;
  }) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  idPrefix?: string;
};

export type CompensationEditDialogProps =
  | CompensationEditDialogApplicationProps
  | CompensationEditDialogDraftProps;

function isDraftProps(
  p: CompensationEditDialogProps,
): p is CompensationEditDialogDraftProps {
  return "mode" in p && p.mode === "draft";
}

export function CompensationEditDialog(props: CompensationEditDialogProps) {
  const isDraft = isDraftProps(props);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "",
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
              id: (props as CompensationEditDialogApplicationProps).application
                .id,
            },
          },
          { query: ApplicationsDocument },
        ],
  });

  const open = isDraft ? props.open : applicationOpen;
  const disabledInputs = isDraft ? Boolean(props.disabled) : false;
  const idPrefix = isDraft ? (props.idPrefix ?? "ai-draft-sal") : "ov-sal";

  function syncFromApplication(application: ApplicationDetailsValues) {
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

  function syncFromDraft(c: DraftCompensation) {
    setForm({
      salaryMin: centsToMajorInput(c.salaryMinCents),
      salaryMax: centsToMajorInput(c.salaryMaxCents),
      salaryCurrency: c.salaryCurrency ?? "",
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
      syncFromDraft(props.compensation);
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
    const payload = {
      salaryMinCents: hasAmount ? minC : null,
      salaryMaxCents: hasAmount ? maxC : null,
      salaryCurrency: hasAmount && cur ? cur : null,
      salaryPeriod: hasAmount && periodVal ? periodVal : null,
    };

    try {
      if (isDraft) {
        props.onCompensationSave(payload);
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
      props.onSuccess?.("Compensation updated.");
      setApplicationOpen(false);
    } catch {
      if (isDraft) {
        props.onError?.("Could not update compensation.");
      } else {
        (props as CompensationEditDialogApplicationProps).onError?.(
          "Could not update compensation.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      title="Edit compensation"
      description="Update salary range, currency, and pay period details for this application."
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        isDraft ? (
          (props.trigger ?? <span aria-hidden style={{ display: "none" }} />)
        ) : (
          <FieldEditTriggerButton label="Edit compensation" />
        )
      }
    >
      <Stack gap="sm">
        <Text size="sm" color="secondary">
          Optional salary range, currency, and pay period.
        </Text>
        <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2")}>
          <FormField
            label="Min (major units)"
            htmlFor={`${idPrefix}-min`}
            hint="e.g. 100000.50"
          >
            <Input
              id={`${idPrefix}-min`}
              inputMode="decimal"
              value={form.salaryMin}
              onChange={(e) =>
                setForm((f) => ({ ...f, salaryMin: e.target.value }))
              }
              disabled={saving || disabledInputs}
            />
          </FormField>
          <FormField
            label="Max (major units)"
            htmlFor={`${idPrefix}-max`}
            hint="Optional upper bound"
          >
            <Input
              id={`${idPrefix}-max`}
              inputMode="decimal"
              value={form.salaryMax}
              onChange={(e) =>
                setForm((f) => ({ ...f, salaryMax: e.target.value }))
              }
              disabled={saving || disabledInputs}
            />
          </FormField>
        </div>
        <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2")}>
          <FormField
            label="Currency"
            htmlFor={`${idPrefix}-cur`}
            hint="ISO 4217"
            error={error}
          >
            <Input
              id={`${idPrefix}-cur`}
              value={form.salaryCurrency}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  salaryCurrency: e.target.value.toUpperCase().slice(0, 3),
                }))
              }
              maxLength={3}
              disabled={saving || disabledInputs}
              placeholder="BRL"
            />
          </FormField>
          <FormField label="Pay period" htmlFor={`${idPrefix}-period`}>
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
