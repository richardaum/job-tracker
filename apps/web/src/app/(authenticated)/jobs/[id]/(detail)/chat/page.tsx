import { cn, Text } from "@job-tracker/ui";

type PageProps = { params: Promise<{ id: string }> };

export default function AiChatPage(_props: PageProps) {
  return (
    <div className={cn("flex items-center justify-center h-full")}>
      <Text size="sm" color="secondary">
        AI Chat
      </Text>
    </div>
  );
}
