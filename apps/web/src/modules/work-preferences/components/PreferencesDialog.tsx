import { Dialog } from "@job-tracker/ui";

import { WorkPreferencesEditor } from "@/modules/work-preferences/components/WorkPreferencesEditor";

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
}

export function PreferencesDialog({ open, onOpenChange, readOnly = false }: PreferencesDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Work Preferences"
      description="What matters to you in a job? These preferences are used to evaluate match against job descriptions."
      childrenClassName="overflow-auto"
    >
      <WorkPreferencesEditor mode="dialog" readOnly={readOnly} onClose={() => onOpenChange(false)} />
    </Dialog>
  );
}
