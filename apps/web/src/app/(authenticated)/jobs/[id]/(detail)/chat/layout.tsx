import type { Metadata } from "next";
import type { ReactNode } from "react";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "AI Chat" };
}

export { default } from "@/modules/jobs/details/page/AiChatLayout";
