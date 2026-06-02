import { cn, TabsContent } from "@job-tracker/ui";
import { AiChatContent } from "./AiChatContent";

type AiChatTabPanelProps = { jobId: string; className?: string };

export function AiChatTabPanel({ jobId: _jobId, className }: AiChatTabPanelProps) {
  return (
    <TabsContent value="chat" className={cn("flex-1 min-h-0 overflow-hidden", className)}>
      <AiChatContent />
    </TabsContent>
  );
}
