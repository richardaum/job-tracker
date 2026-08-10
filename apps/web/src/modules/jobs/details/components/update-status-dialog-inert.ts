export type UpdateStatusDialogRestrictedTarget = "status" | "custom-date" | "save";

export function isInert(
  restrictInteractionTo: UpdateStatusDialogRestrictedTarget | undefined,
  field: UpdateStatusDialogRestrictedTarget,
) {
  return restrictInteractionTo !== undefined && restrictInteractionTo !== field;
}
