import { cn, Text } from "@job-tracker/ui";

type AiChatContentProps = { className?: string };

export function AiChatContent({ className }: AiChatContentProps) {
  return (
    <div className={cn("flex items-center justify-center h-full", className)}>
      <Text size="sm" color="secondary">
        AI Chat
      </Text>
    </div>
  );
}
