import { AiChatContent } from "@/modules/jobs/details/components/AiChatContent";

type PageProps = { params: Promise<{ id: string }> };

export default async function AiChatPage(props: PageProps) {
  const { id } = await props.params;
  return <AiChatContent jobId={id} />;
}
