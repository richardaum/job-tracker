import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "AI Chat" };
}

export { default } from "@/modules/jobs/details/page/AiChatLayout";
