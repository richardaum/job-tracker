import { apiEnv } from "@api/env/server";
import { AiBaseService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { Injectable } from "@nestjs/common";

const SUMMARY_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: { summary: { type: "string", description: "Concise 2-4 sentence paragraph summarizing the job" } },
  required: ["summary"],
  additionalProperties: false,
};

const SUMMARY_SYSTEM_PROMPT = [
  "You are a job-tracking assistant. Given job data below, write 2-4 sentences.",
  "",
  "Focus on the current state of the job, not the original description.",
  "Interpret what the data means for the candidate's progress and fit.",
  "",
  "Examples of interpretation:",
  '- Instead of "Salary is $100k-$150k" → "Compensation range signals senior/principal level expectations."',
  '- Instead of "Stage: technical" → "Advanced to technical screen, suggesting initial approval."',
  '- Instead of "Tags: react, typescript, aws" → "Role demands strong frontend and cloud infrastructure expertise."',
  '- Instead of "Notes: spoke with hiring manager" → "First conversation completed; hiring manager showed positive interest."',
  "",
  "Rules:",
  "- Be concise. 2-4 sentences max.",
  "- Prioritize: current stage, compensation, location flexibility, recent notes, stage velocity.",
  "- Do not repeat field labels or raw values. Synthesize.",
  "- Be factual. Do not add information not present in the context.",
  "- Keep a neutral, professional tone.",
  "- Return plain Markdown. You may use **bold**, *italic*, `code`, and [links](url).",
  "- When mentioning dates, prefer absolute dates (e.g., 'May 10, 2026') over relative dates (e.g., 'recently', '3 days ago').",
].join("\n");

@Injectable()
export class SummaryAiService extends AiBaseService {
  constructor(openAIClient: OpenAIClient, promptRenderer: PromptRendererService) {
    super(openAIClient, promptRenderer);
  }

  async generateSummary(context: string): Promise<string> {
    const result = (await this.callAi({
      systemMessage: SUMMARY_SYSTEM_PROMPT,
      userMessage: `Summarize this job:\n\n${context}`,
      schemaJson: SUMMARY_SCHEMA,
      responseFormat: "json-schema",
      model: apiEnv.OPENAI_MODEL,
    })) as { summary: string };

    return result.summary;
  }
}
