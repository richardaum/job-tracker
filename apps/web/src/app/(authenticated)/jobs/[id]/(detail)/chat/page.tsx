import { AiChatContent } from "@/modules/jobs/details/components/AiChatContent";

type PageProps = { params: Promise<{ id: string }> };

export default function AiChatPage(_props: PageProps) {
  return <AiChatContent />;
}
