import { cn, TabsTrigger } from "@job-tracker/ui";

type NotesSideTabTriggerProps = { jobId: string };

export function NotesSideTabTrigger({ jobId: _jobId }: NotesSideTabTriggerProps) {
  return (
    <TabsTrigger value="notes" className={cn("flex-1 flex items-center justify-center gap-1.5")}>
      <span>Notes</span>
    </TabsTrigger>
  );
}
