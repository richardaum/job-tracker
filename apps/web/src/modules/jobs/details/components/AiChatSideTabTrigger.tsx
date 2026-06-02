import { cn, conceptIcon, TabsTrigger } from "@job-tracker/ui";

export function AiChatSideTabTrigger() {
  return (
    <TabsTrigger value="chat" leadingIcon={<conceptIcon.ai size={14} weight="regular" />} className={cn("flex-1")}>
      AI Chat
    </TabsTrigger>
  );
}
