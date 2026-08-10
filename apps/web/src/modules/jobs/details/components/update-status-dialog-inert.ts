export type UpdateStatusDialogRestrictedTarget = "status" | "custom-date" | "schedule-3d" | "reason" | "save";

export function isInert(
  restrictInteractionTo: UpdateStatusDialogRestrictedTarget | undefined,
  field: UpdateStatusDialogRestrictedTarget,
) {
  return (
    restrictInteractionTo !== undefined &&
    restrictInteractionTo !== field &&
    !(restrictInteractionTo === "schedule-3d" && field === "custom-date")
  );
}
