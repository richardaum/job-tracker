import { JobStageEventsRepository } from "@api/domains/jobs/job-stage-events.repository";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { MatchAnalysisRepository } from "@api/domains/match-analysis/match-analysis.repository";
import { NoteRepository } from "@api/domains/notes/notes.repository";
import { apiEnv } from "@api/env/server";
import { AiBaseService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { Injectable, Logger } from "@nestjs/common";

import { AiChatPubSub } from "./ai-chat.pubsub";
import { AiChatSubEventEnum } from "./ai-chat-sub-event.enum";
import { AiMessageStreamPhaseEnum } from "./ai-message-stream-phase.enum";

@Injectable()
export class AiChatGenerationService extends AiBaseService {
  private readonly logger = new Logger(AiChatGenerationService.name);

  constructor(
    openAIClient: OpenAIClient,
    promptRenderer: PromptRendererService,
    private readonly jobsRepo: JobsRepository,
    private readonly matchAnalysisRepo: MatchAnalysisRepository,
    private readonly notesRepo: NoteRepository,
    private readonly stageEventsRepo: JobStageEventsRepository,
    private readonly pubSub: AiChatPubSub,
  ) {
    super(openAIClient, promptRenderer);
  }

  async generateAnswer(conversationId: string, userId: string, jobId: string, question: string): Promise<string> {
    this.logger.log(`Asking AI question: conversationId=${conversationId}, jobId=${jobId}`);

    const job = await this.jobsRepo.findOneByIdAndUserId(jobId, userId);
    if (!job) {
      this.logger.warn(`Job ${jobId} not found for user ${userId}`);
      return "";
    }

    const [matchAnalysis, notes, stageEvents] = await Promise.all([
      this.matchAnalysisRepo.findByJobId(jobId, userId).catch(() => null),
      this.notesRepo.findByJobIdAndUserId(jobId, userId).catch(() => []),
      this.stageEventsRepo.findStageEventsByJobIdAndUserId(jobId, userId).catch(() => []),
    ]);

    const systemPrompt = this.buildSystemPrompt(job, matchAnalysis, notes, stageEvents);

    const client = this.openAIClient.getClient();
    const model = apiEnv.OPENAI_MODEL;
    const stream = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.1,
      stream: true,
    });

    let fullContent = "";
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (!token) continue;

      fullContent += token;
      await this.pubSub.publish(AiChatSubEventEnum.AiMessageStreamed, {
        conversationId,
        phase: AiMessageStreamPhaseEnum.Streaming,
        token,
      });
    }

    this.logger.log(`AI stream completed: conversationId=${conversationId}, tokens=${fullContent.length}`);
    return fullContent;
  }

  async generateTitle(question: string): Promise<string> {
    const client = this.openAIClient.getClient();
    const model = apiEnv.OPENAI_MODEL;
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Generate a very short title (3-5 words) for a conversation about job applications. Reply with ONLY the title, no quotes, no punctuation at the end.",
        },
        { role: "user", content: question },
      ],
      temperature: 0.3,
      max_tokens: 30,
    });

    return response.choices[0]?.message?.content?.trim() || "New conversation";
  }

  private buildSystemPrompt(
    job: {
      title: string | null;
      description: string | null;
      company?: { name: string; description?: string | null; industry?: string | null } | null;
    },
    matchAnalysis: { summary?: string | null; items?: unknown[] | null } | null,
    notes: Array<{ content: string; createdAt: Date }>,
    stageEvents: Array<{ toStage: string; fromStage?: string | null; reason?: string | null; createdAt: Date }>,
  ): string {
    const sections: string[] = [
      "You are an AI assistant helping with job applications. You have access to the following context about this job:",
    ];

    sections.push("--- Job Information ---");
    sections.push(`Title: ${job.title}`);
    if (job.description) {
      sections.push(`Description:\n${job.description}`);
    }

    if (job.company) {
      sections.push("--- Company Information ---");
      sections.push(`Name: ${job.company.name}`);
      if (job.company.description) {
        sections.push(`Description: ${job.company.description}`);
      }
      if (job.company.industry) {
        sections.push(`Industry: ${job.company.industry}`);
      }
    }

    if (matchAnalysis?.summary) {
      sections.push("--- Match Analysis Summary ---");
      sections.push(matchAnalysis.summary);
    }
    if (matchAnalysis?.items && matchAnalysis.items.length > 0) {
      sections.push("--- Match Analysis Items ---");
      for (const item of matchAnalysis.items as Array<Record<string, unknown>>) {
        const cat = "category" in item ? String(item.category ?? "general") : "general";
        const content = "requirement" in item ? String(item.requirement) : JSON.stringify(item);
        sections.push(`[${cat}] ${content}`);
      }
    }

    if (notes.length > 0) {
      sections.push("--- Notes from the User ---");
      for (const note of notes) {
        sections.push(`[${note.createdAt.toISOString()}] ${note.content}`);
      }
    }

    if (stageEvents.length > 0) {
      sections.push("--- Application Stage History ---");
      for (const event of stageEvents) {
        const from = event.fromStage ?? "none";
        const reason = event.reason ? ` (reason: ${event.reason})` : "";
        sections.push(`[${event.createdAt.toISOString()}] ${from} → ${event.toStage}${reason}`);
      }
    }

    sections.push("");
    sections.push("--- Rules ---");
    sections.push("1. Only answer from the provided context above.");
    sections.push("2. For each claim, cite which source section it comes from.");
    sections.push("3. If the answer is not in the context, say so explicitly.");
    sections.push("4. Do not invent information not present in the context.");
    sections.push("5. Keep answers concise and relevant to the job application context.");

    return sections.join("\n");
  }
}
