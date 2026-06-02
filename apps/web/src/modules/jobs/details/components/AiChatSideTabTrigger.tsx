import { cn, TabsTrigger } from "@job-tracker/ui";
import { SparkleIcon } from "@phosphor-icons/react";

export function AiChatSideTabTrigger() {
  return (
    <TabsTrigger value="chat" className={cn("flex-1 flex items-center gap-1.5")}>
      <SparkleIcon size={14} weight="regular" />
      <span>AI Chat</span>
    </TabsTrigger>
  );
}
