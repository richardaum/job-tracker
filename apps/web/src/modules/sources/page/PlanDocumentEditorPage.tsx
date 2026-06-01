"use client";

import { Button, Card, cn, DropdownMenu, DropdownMenuItem, InfoTooltip, Radio, Text } from "@job-tracker/ui";
import { CaretDownIcon, DownloadSimpleIcon, PlusIcon } from "@phosphor-icons/react";
import { use, useState } from "react";

import { PlanHeaderActions, PlanTabDescription } from "@/modules/sources/page/plan-details-header.slots";
import { AddStepDialog } from "@/modules/sources/page/plan-editor/AddStepDialog";
import { DetailsFieldEditDialog } from "@/modules/sources/page/plan-editor/DetailsFieldEditDialog";
import { NavigationDialog } from "@/modules/sources/page/plan-editor/NavigationDialog";
import { PaginationDialog } from "@/modules/sources/page/plan-editor/PaginationDialog";
import { ParseRegexFieldEditDialog } from "@/modules/sources/page/plan-editor/ParseRegexFieldEditDialog";
import { ParseRegexStepDialog } from "@/modules/sources/page/plan-editor/ParseRegexStepDialog";
import { ReadyCheckDialog } from "@/modules/sources/page/plan-editor/ReadyCheckDialog";
import { SelectorsDialog } from "@/modules/sources/page/plan-editor/SelectorsDialog";
import { StepCard } from "@/modules/sources/page/plan-editor/StepCard";
import { SkipDialog } from "@/modules/sources/page/plan-editor/SkipDialog";
import { SurfaceFieldEditDialog } from "@/modules/sources/page/plan-editor/SurfaceFieldEditDialog";
import type {
  BoardType,
  CollectJobsInput,
  DetailsField,
  ParseRegexField,
  Step,
  SurfaceField,
} from "@/modules/sources/page/plan-editor/types";
import { deepEqual, defaultCollectJobs, defaultParseRegex } from "@/modules/sources/page/plan-editor/utils";
import { usePlanQuery, useUpdatePlanMutation } from "@/gql/hooks";
import type { PlanQuery } from "@/gql/graphql";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { tryRun } from "@job-tracker/try-run";

function parseDocument(document: Record<string, unknown> | null | undefined): { boardType: BoardType; steps: Step[] } {
  const d = document ?? {};
  return { boardType: (d.boardType as BoardType) || "Sequential", steps: (d.steps as Step[]) || [] };
}

function getCollectJobsInput(step: Step): CollectJobsInput {
  return (step.action as { kind: "collect.jobs"; input: CollectJobsInput }).input;
}

type PlanEditorProps = { plan: NonNullable<PlanQuery["plan"]> };
function PlanEditor({ plan }: PlanEditorProps) {
  const [updatePlan] = useUpdatePlanMutation();
  const { enqueueToast } = useToastQueue();
  const initialDoc = parseDocument(plan.document);

  const [boardType, setBoardType] = useState<BoardType>(initialDoc.boardType);
  const [steps, setSteps] = useState<Step[]>(initialDoc.steps);
  const [saving, setSaving] = useState(false);

  const changed = boardType !== initialDoc.boardType || !deepEqual(steps, initialDoc.steps);

  const [editingSelectors, setEditingSelectors] = useState<Step | null>(null);
  const [editingNavigation, setEditingNavigation] = useState<Step | null>(null);
  const [editingPagination, setEditingPagination] = useState<Step | null>(null);
  const [editingSkip, setEditingSkip] = useState<Step | null>(null);
  const [editingParse, setEditingParse] = useState<Step | null>(null);
  const [editingReadyCheck, setEditingReadyCheck] = useState<Step | null>(null);
  const [regexFieldDialog, setRegexFieldDialog] = useState<{
    step: Step;
    field: ParseRegexField | null;
    index: number;
  } | null>(null);
  const [fieldDialog, setFieldDialog] = useState<{
    step: Step;
    kind: "surface" | "details";
    field: SurfaceField | DetailsField | null;
    index: number;
  } | null>(null);
  const [addStepOpen, setAddStepOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

  function handleExportJson() {
    const blob = new Blob([JSON.stringify({ boardType, steps }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plan.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSave() {
    setSaving(true);
    const [err] = await tryRun(updatePlan({ variables: { id: plan.id, input: { document: { boardType, steps } } } }));
    setSaving(false);
    if (err) {
      enqueueToast({ title: err instanceof Error ? err.message : "Could not save plan. Try again.", intent: "error" });
      return;
    }
    enqueueToast({ title: "Plan saved.", intent: "success" });
  }

  function handleEditField(step: Step, kind: "surface" | "details", fieldIndex: number) {
    const fields =
      kind === "surface" ? getCollectJobsInput(step).surfaceFields : getCollectJobsInput(step).detailsFields;
    setFieldDialog({ step, kind, field: fields[fieldIndex] as SurfaceField | DetailsField, index: fieldIndex });
  }

  function handleEditRegexField(step: Step, fieldIndex: number) {
    const fields = (step.action as { kind: "parse.regex"; input: { fields: ParseRegexField[] } }).input.fields;
    setRegexFieldDialog({ step, field: fields[fieldIndex], index: fieldIndex });
  }

  function replaceStep(old: Step, updated: Step) {
    setSteps((prev) => prev.map((s) => (s.id === old.id ? updated : s)));
  }

  function replaceSurfaceFields(step: Step, fields: SurfaceField[]) {
    const input = { ...getCollectJobsInput(step), surfaceFields: fields };
    setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, action: { kind: "collect.jobs", input } } : s)));
  }

  function replaceDetailsFields(step: Step, fields: DetailsField[]) {
    const input = { ...getCollectJobsInput(step), detailsFields: fields };
    setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, action: { kind: "collect.jobs", input } } : s)));
  }

  function handleSaveField(step: Step, kind: "surface" | "details", index: number, field: SurfaceField | DetailsField) {
    const input = getCollectJobsInput(step);
    const fields = kind === "surface" ? [...input.surfaceFields] : [...input.detailsFields];
    fields[index] = field as SurfaceField & DetailsField;
    if (kind === "surface") replaceSurfaceFields(step, fields as SurfaceField[]);
    else replaceDetailsFields(step, fields as DetailsField[]);
  }

  function handleDeleteField(step: Step, kind: "surface" | "details", index: number) {
    const input = getCollectJobsInput(step);
    if (kind === "surface") {
      replaceSurfaceFields(
        step,
        input.surfaceFields.filter((_, i) => i !== index),
      );
    } else {
      replaceDetailsFields(
        step,
        input.detailsFields.filter((_, i) => i !== index),
      );
    }
  }

  function handleAddField(step: Step, kind: "surface" | "details", field: SurfaceField | DetailsField) {
    const input = getCollectJobsInput(step);
    const fields =
      kind === "surface"
        ? [...input.surfaceFields, field as SurfaceField]
        : [...input.detailsFields, field as DetailsField];
    if (kind === "surface") replaceSurfaceFields(step, fields as SurfaceField[]);
    else replaceDetailsFields(step, fields as DetailsField[]);
  }

  function handleSaveRegexField(step: Step, index: number, field: ParseRegexField) {
    const action = step.action as { kind: "parse.regex"; input: { text: string; fields: ParseRegexField[] } };
    const fields = [...action.input.fields];
    fields[index] = field;
    setSteps((prev) =>
      prev.map((s) =>
        s.id === step.id ? { ...s, action: { kind: "parse.regex", input: { ...action.input, fields } } } : s,
      ),
    );
  }

  function handleAddRegexField(step: Step, field: ParseRegexField) {
    const action = step.action as { kind: "parse.regex"; input: { text: string; fields: ParseRegexField[] } };
    const fields = [...action.input.fields, field];
    setSteps((prev) =>
      prev.map((s) =>
        s.id === step.id ? { ...s, action: { kind: "parse.regex", input: { ...action.input, fields } } } : s,
      ),
    );
  }

  function handleDeleteStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  function handleAddStep(kind: "collect.jobs" | "parse.regex") {
    const id = `step-${steps.length + 1}`;
    const step: Step =
      kind === "collect.jobs"
        ? { id, action: { kind, input: defaultCollectJobs() } }
        : { id, action: { kind, input: defaultParseRegex() } };
    setSteps((prev) => [...prev, step]);
  }

  return (
    <>
      <PlanTabDescription>Configure extraction rules and constraints for this plan.</PlanTabDescription>
      <PlanHeaderActions>
        <div className={cn("flex items-center gap-2")}>
          <DropdownMenu
            open={actionsMenuOpen}
            onOpenChange={setActionsMenuOpen}
            trigger={
              <Button
                intent="secondary"
                size="md"
                rightIcon={
                  <CaretDownIcon
                    className={cn("transition-transform", actionsMenuOpen && "rotate-180")}
                    size={14}
                    weight="bold"
                  />
                }
              >
                Actions
              </Button>
            }
          >
            <DropdownMenuItem icon={<DownloadSimpleIcon size={16} />} onSelect={handleExportJson}>
              Export JSON
            </DropdownMenuItem>
          </DropdownMenu>
          <Button
            intent="primary"
            size="md"
            state={saving ? "loading" : "default"}
            disabled={!changed || saving}
            onClick={() => void handleSave()}
          >
            Save
          </Button>
        </div>
      </PlanHeaderActions>

      <div className={cn("flex min-h-0 flex-1 flex-col gap-6 overflow-auto pe-3")}>
        <Card padding="md">
          <div className={cn("flex items-center justify-between")}>
            <div className={cn("flex items-center gap-1.5")}>
              <Text size="sm" weight="medium">
                Board Type
              </Text>
              <InfoTooltip
                content={
                  <>
                    Sequential: jobs appear in predictable order (newest first). Enables CatchUp.
                    <br />
                    NonSequential: jobs appear in no clear order; CatchUp is not available.
                  </>
                }
              />
            </div>
            <Radio
              options={[
                { label: "Sequential", value: "Sequential" },
                { label: "NonSequential", value: "NonSequential" },
              ]}
              value={boardType}
              onValueChange={(v) => setBoardType(v as BoardType)}
              orientation="horizontal"
            />
          </div>
        </Card>

        <div className={cn("flex flex-col gap-3")}>
          <Text size="sm" weight="medium">
            Steps ({steps.length})
          </Text>
          {steps.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={i}
              onEditSelectors={setEditingSelectors}
              onEditNavigation={setEditingNavigation}
              onEditPagination={setEditingPagination}
              onEditSkip={setEditingSkip}
              onEditReadyCheck={setEditingReadyCheck}
              onAddField={(s, k) => setFieldDialog({ step: s, kind: k, field: null, index: -1 })}
              onEditField={handleEditField}
              onEditParse={setEditingParse}
              onAddRegexField={(s) => setRegexFieldDialog({ step: s, field: null, index: -1 })}
              onEditRegexField={handleEditRegexField}
              onDelete={handleDeleteStep}
            />
          ))}
          <div>
            <Button intent="secondary" size="sm" leftIcon={<PlusIcon size={14} />} onClick={() => setAddStepOpen(true)}>
              Add Step
            </Button>
          </div>
        </div>
      </div>

      {editingSelectors?.action.kind === "collect.jobs" && (
        <SelectorsDialog
          key={editingSelectors.id}
          step={editingSelectors}
          open
          onOpenChange={() => setEditingSelectors(null)}
          onSave={(s: Step) => {
            replaceStep(editingSelectors, s);
            setEditingSelectors(null);
          }}
        />
      )}
      {editingNavigation?.action.kind === "collect.jobs" && (
        <NavigationDialog
          key={editingNavigation.id}
          step={editingNavigation}
          open
          onOpenChange={() => setEditingNavigation(null)}
          onSave={(s: Step) => {
            replaceStep(editingNavigation, s);
            setEditingNavigation(null);
          }}
        />
      )}
      {editingPagination?.action.kind === "collect.jobs" && (
        <PaginationDialog
          key={editingPagination.id}
          step={editingPagination}
          open
          onOpenChange={() => setEditingPagination(null)}
          onSave={(s: Step) => {
            replaceStep(editingPagination, s);
            setEditingPagination(null);
          }}
        />
      )}
      {editingSkip?.action.kind === "collect.jobs" && (
        <SkipDialog
          key={editingSkip.id}
          step={editingSkip}
          open
          onOpenChange={() => setEditingSkip(null)}
          onSave={(s: Step) => {
            replaceStep(editingSkip, s);
            setEditingSkip(null);
          }}
        />
      )}
      {editingReadyCheck?.action.kind === "collect.jobs" && (
        <ReadyCheckDialog
          key={editingReadyCheck.id}
          step={editingReadyCheck}
          open
          onOpenChange={() => setEditingReadyCheck(null)}
          onSave={(s: Step) => {
            replaceStep(editingReadyCheck, s);
            setEditingReadyCheck(null);
          }}
        />
      )}
      {fieldDialog?.kind === "surface" && fieldDialog.step.action.kind === "collect.jobs" && (
        <SurfaceFieldEditDialog
          key={`surface-${fieldDialog.index}`}
          field={fieldDialog.field as SurfaceField | null}
          open
          availableKeys={fieldDialog.step.action.input.surfaceFields
            .map((f) => f.key)
            .filter((key) => {
              if (fieldDialog.index === -1) return true;
              if (!fieldDialog.field) return true;
              return key !== fieldDialog.field.key;
            })}
          onOpenChange={() => setFieldDialog(null)}
          onSave={(f) => {
            if (fieldDialog.index === -1) handleAddField(fieldDialog.step, "surface", f);
            else handleSaveField(fieldDialog.step, "surface", fieldDialog.index, f);
            setFieldDialog(null);
          }}
          onDelete={() => {
            handleDeleteField(fieldDialog.step, "surface", fieldDialog.index);
            setFieldDialog(null);
          }}
        />
      )}
      {fieldDialog?.kind === "details" && fieldDialog.step.action.kind === "collect.jobs" && (
        <DetailsFieldEditDialog
          key={`details-${fieldDialog.index}`}
          field={fieldDialog.field as DetailsField | null}
          open
          onOpenChange={() => setFieldDialog(null)}
          onSave={(f) => {
            if (fieldDialog.index === -1) handleAddField(fieldDialog.step, "details", f);
            else handleSaveField(fieldDialog.step, "details", fieldDialog.index, f);
            setFieldDialog(null);
          }}
          onDelete={() => {
            handleDeleteField(fieldDialog.step, "details", fieldDialog.index);
            setFieldDialog(null);
          }}
        />
      )}
      {editingParse?.action.kind === "parse.regex" && (
        <ParseRegexStepDialog
          key={editingParse.id}
          step={editingParse}
          open
          onOpenChange={() => setEditingParse(null)}
          onSave={(s) => {
            replaceStep(editingParse, s);
            setEditingParse(null);
          }}
        />
      )}
      {regexFieldDialog?.step.action.kind === "parse.regex" && (
        <ParseRegexFieldEditDialog
          key={`regex-${regexFieldDialog.index}`}
          field={regexFieldDialog.field}
          open
          onOpenChange={() => setRegexFieldDialog(null)}
          onSave={(f) => {
            if (regexFieldDialog.index === -1) handleAddRegexField(regexFieldDialog.step, f);
            else handleSaveRegexField(regexFieldDialog.step, regexFieldDialog.index, f);
            setRegexFieldDialog(null);
          }}
        />
      )}
      <AddStepDialog open={addStepOpen} onOpenChange={setAddStepOpen} onAdd={handleAddStep} />
    </>
  );
}

type PlanDocumentEditorPageProps = { params: Promise<{ planId: string }> };

export function PlanDocumentEditorPage({ params }: PlanDocumentEditorPageProps) {
  const { planId } = use(params);
  const { data, loading } = usePlanQuery({ variables: { id: planId } });

  const plan = data?.plan ?? null;

  if (loading) {
    return (
      <div className={cn("flex h-full items-center justify-center")}>
        <Text color="muted">Loading...</Text>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className={cn("flex h-full items-center justify-center")}>
        <Text color="muted">Plan not found.</Text>
      </div>
    );
  }

  return <PlanEditor key={plan.id} plan={plan} />;
}
