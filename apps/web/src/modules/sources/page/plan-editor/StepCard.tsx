"use client";

import {
  Badge,
  Card,
  cn,
  IconButton,
  InfoTooltip,
  Text,
} from "@job-tracker/ui";
import {
  ArrowsDownUpIcon,
  CaretDoubleRightIcon,
  GearSixIcon,
  ListMagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import type { Step } from "@/modules/sources/page/plan-editor/types";

type StepCardProps = {
  step: Step;
  index: number;
  onEditSelectors: (step: Step) => void;
  onEditNavigation: (step: Step) => void;
  onEditPagination: (step: Step) => void;
  onAddField: (step: Step, kind: "surface" | "details") => void;
  onEditField: (
    step: Step,
    kind: "surface" | "details",
    fieldIndex: number,
  ) => void;
  onEditParse: (step: Step) => void;
  onAddRegexField: (step: Step) => void;
  onEditRegexField: (step: Step, fieldIndex: number) => void;
  onDelete: (id: string) => void;
};

export function StepCard({
  step,
  index,
  onEditSelectors,
  onEditNavigation,
  onEditPagination,
  onAddField,
  onEditField,
  onEditParse,
  onAddRegexField,
  onEditRegexField,
  onDelete,
}: StepCardProps) {
  if (step.action.kind === "parse.regex") {
    const fc = step.action.input.fields.length;
    return (
      <Card padding="md">
        <div className={cn("flex flex-col gap-3")}>
          <div className={cn("flex items-start justify-between")}>
            <div className={cn("flex min-w-0 flex-col gap-1")}>
              <div className={cn("flex items-center gap-2")}>
                <Text size="xs" color="muted" className={cn("tabular-nums")}>
                  {index + 1}.
                </Text>
                <Text size="sm" weight="medium" className={cn("font-mono")}>
                  {step.id}
                </Text>
                <Badge intent="warning">parse regex</Badge>
              </div>
              <Text size="xs" color="muted" className={cn("font-mono")}>
                Text: {step.action.input.text}
              </Text>
            </div>
            <div className={cn("flex shrink-0 items-center gap-1")}>
              <IconButton
                icon={<GearSixIcon size={12} />}
                label="Edit step config"
                tooltip="Edit step configuration (text source)"
                size="xs"
                intent="quiet"
                onClick={() => onEditParse(step)}
              />
              <IconButton
                icon={<TrashIcon size={12} />}
                label="Delete step"
                tooltip="Delete step"
                size="xs"
                intent="quiet"
                className="hover:!text-text-error"
                onClick={() => onDelete(step.id)}
              />
            </div>
          </div>

          <div className={cn("border-t border-border-subtle pt-2")}>
            <div className={cn("flex items-center justify-between")}>
              <Text size="xs" weight="medium" color="secondary">
                Regex Fields ({fc})
              </Text>
              <IconButton
                icon={<PlusIcon size={12} />}
                label="Add regex field"
                tooltip="Add regex field"
                size="xs"
                intent="quiet"
                className="text-text-muted hover:bg-bg-surface-hover hover:text-text-primary"
                onClick={() => onEditParse(step)}
              />
              <IconButton
                icon={<TrashIcon size={14} />}
                label="Delete step"
                tooltip="Delete step"
                size="sm"
                intent="ghost"
                className="text-text-muted hover:bg-bg-surface-hover hover:text-text-error"
                onClick={() => onDelete(step.id)}
              />
            </div>
          </div>

          <div className={cn("border-t border-border-subtle pt-2")}>
            <div className={cn("flex items-center justify-between")}>
              <Text size="xs" weight="medium" color="secondary">
                Regex Fields ({fc})
              </Text>
              <IconButton
                icon={<PlusIcon size={14} />}
                label="Add regex field"
                tooltip="Add regex field"
                size="sm"
                intent="ghost"
                className="text-text-muted hover:bg-bg-surface-hover hover:text-text-brand"
                onClick={() => onAddRegexField(step)}
              />
            </div>
            {fc > 0 && (
              <div className={cn("flex flex-wrap gap-1.5 pt-1.5")}>
                {step.action.input.fields.map((f, fi) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => onEditRegexField(step, fi)}
                    className={cn("cursor-pointer")}
                  >
                    <Badge
                      intent="default"
                      className={cn(
                        "font-mono text-xs cursor-pointer hover:bg-bg-surface-hover transition-colors",
                      )}
                    >
                      {f.key}
                      {f.required && (
                        <span className={cn("text-text-error ml-0.5")}>*</span>
                      )}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  const i = step.action.input;
  const sfc = i.surfaceFields.length;
  const dfc = i.detailsFields.length;

  return (
    <Card padding="md">
      <div className={cn("flex flex-col gap-3")}>
        <div className={cn("flex items-start justify-between")}>
          <div className={cn("flex min-w-0 flex-col gap-1")}>
            <div className={cn("flex items-center gap-2")}>
              <Text size="xs" color="muted" className={cn("tabular-nums")}>
                {index + 1}.
              </Text>
              <Text size="sm" weight="medium" className={cn("font-mono")}>
                {step.id}
              </Text>
              <Badge intent="info">collect jobs</Badge>
            </div>
            <Text size="xs" color="muted" className={cn("font-mono")}>
              {i.containerSelector} · {i.itemSelector}
              {" · "}
              {i.direction === "up" ? "⬆ up" : "⬇ down"}
              {" · "}
              {i.parallelDetailsTabs > 1
                ? `${i.parallelDetailsTabs} tabs`
                : "1 tab"}
              {" · "}
              {i.pagination ? "pag on" : "pag off"}
            </Text>
          </div>
          <div className={cn("flex shrink-0 items-center gap-1")}>
            <IconButton
              icon={<ListMagnifyingGlassIcon size={12} />}
              label="Edit selectors"
              tooltip="Edit selectors (container, item, key)"
              size="xs"
              intent="quiet"
              onClick={() => onEditSelectors(step)}
            />
            <IconButton
              icon={<ArrowsDownUpIcon size={12} />}
              label="Edit navigation"
              tooltip="Edit navigation (direction, tabs)"
              size="xs"
              intent="quiet"
              onClick={() => onEditNavigation(step)}
            />
            <IconButton
              icon={<CaretDoubleRightIcon size={12} />}
              label="Edit pagination"
              tooltip="Edit pagination"
              size="xs"
              intent="quiet"
              onClick={() => onEditPagination(step)}
            />
            <IconButton
              icon={<TrashIcon size={12} />}
              label="Delete step"
              tooltip="Delete step"
              size="xs"
              intent="quiet"
              className="hover:!text-text-error"
              onClick={() => onDelete(step.id)}
            />
          </div>
        </div>

        <div className={cn("border-t border-border-subtle pt-2")}>
          <div className={cn("flex items-center justify-between")}>
            <span className={cn("inline-flex items-center gap-1")}>
              <Text size="xs" weight="medium" color="secondary">
                Surface Fields ({sfc})
              </Text>
              <InfoTooltip
                content="Fields extracted from each listing row without opening a detail page."
                size={12}
              />
            </span>
            <IconButton
              icon={<PlusIcon size={12} />}
              label="Add surface field"
              tooltip="Add surface field"
              size="xs"
              intent="quiet"
              onClick={() => onAddField(step, "surface")}
            />
          </div>
          {sfc > 0 && (
            <div className={cn("flex flex-wrap gap-1.5 pt-1.5")}>
              {i.surfaceFields.map((f, fi) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => onEditField(step, "surface", fi)}
                  className={cn("cursor-pointer")}
                >
                  <Badge
                    intent="default"
                    className={cn(
                      "font-mono text-xs cursor-pointer hover:bg-bg-surface-hover transition-colors",
                    )}
                  >
                    {f.key}
                    <span className={cn("text-text-muted ml-0.5")}>
                      {f.type === "regex"
                        ? "~"
                        : f.type === "attribute"
                          ? "@"
                          : "."}
                    </span>
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={cn("border-t border-border-subtle pt-2")}>
          <div className={cn("flex items-center justify-between")}>
            <span className={cn("inline-flex items-center gap-1")}>
              <Text size="xs" weight="medium" color="secondary">
                Details Fields ({dfc})
              </Text>
              <InfoTooltip
                content="Fields extracted from each listing's detail page after opening it."
                size={12}
              />
            </span>
            <IconButton
              icon={<PlusIcon size={12} />}
              label="Add details field"
              tooltip="Add details field"
              size="xs"
              intent="quiet"
              onClick={() => onAddField(step, "details")}
            />
          </div>
          {dfc > 0 && (
            <div className={cn("flex flex-wrap gap-1.5 pt-1.5")}>
              {i.detailsFields.map((f, fi) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => onEditField(step, "details", fi)}
                  className={cn("cursor-pointer")}
                >
                  <Badge
                    intent="default"
                    className={cn(
                      "font-mono text-xs cursor-pointer hover:bg-bg-surface-hover transition-colors",
                    )}
                  >
                    {f.key}
                    {f.format && (
                      <span className={cn("text-text-muted ml-0.5")}>
                        [{f.format}]
                      </span>
                    )}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
