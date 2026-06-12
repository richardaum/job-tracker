import { cn, TabsContent } from "@job-tracker/ui";
import { AiChatContent } from "./AiChatContent";

type AiChatTabPanelProps = { jobId: string; className?: string };

/** TabsContent wrapper for the job detail AI chat tab. */
export function AiChatTabPanel({ jobId, className }: AiChatTabPanelProps) {
  return (
    <TabsContent value="chat" className={cn("flex-1 min-h-0 overflow-hidden", className)}>
      <AiChatContent jobId={jobId} />
    </TabsContent>
  );
}
