import { AiChatContent } from "@/modules/jobs/details/components/AiChatContent";
import { AI_CHAT_FEATURE_FLAG } from "@/modules/jobs/details/ai-chat-feature-flag";
import { getPostHogDistinctId, getServerFeatureFlag } from "@/lib/posthog-server";
import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function AiChatPage(props: PageProps) {
  const { id } = await props.params;
  const distinctId = await getPostHogDistinctId();
  const aiChatEnabled = await getServerFeatureFlag(AI_CHAT_FEATURE_FLAG, distinctId);
  if (!aiChatEnabled) redirect(`/jobs/${id}`);

  return <AiChatContent jobId={id} />;
}
