import type { FieldWithLabelActionProps as FieldWithLabelActionBaseProps } from "./FieldWithLabelAction";
import { FieldWithLabelAction as FieldWithLabelActionBase } from "./FieldWithLabelAction";
import type { FieldWithLabelActionIconActionButtonProps } from "./FieldWithLabelActionIconActionButton";
import { FieldWithLabelActionIconActionButton } from "./FieldWithLabelActionIconActionButton";
import type { FieldWithLabelActionTooltipProps } from "./FieldWithLabelActionTooltip";
import { FieldWithLabelActionTooltip } from "./FieldWithLabelActionTooltip";

export const FieldWithLabelAction = Object.assign(FieldWithLabelActionBase, {
  Tooltip: FieldWithLabelActionTooltip,
  IconActionButton: FieldWithLabelActionIconActionButton,
});

export type FieldWithLabelActionProps = FieldWithLabelActionBaseProps;
export type {
  FieldWithLabelActionIconActionButtonProps,
  FieldWithLabelActionTooltipProps,
};
export { FieldWithLabelActionIconActionButton, FieldWithLabelActionTooltip };
