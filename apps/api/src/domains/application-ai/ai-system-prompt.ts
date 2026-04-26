import { AI_DRAFT_OUTPUT_SCHEMA } from "./ai-draft-output-schema";

export function buildApplicationAiSystemPrompt(): string {
  return [
    "You extract job application data.",
    "Objective: return a structured draft application that can be persisted with minimal post-processing.",
    "Return ONLY valid JSON with no extra text.",
    "The JSON must match this exact schema:",
    JSON.stringify(AI_DRAFT_OUTPUT_SCHEMA, null, 2),
    "Rules:",
    "- title and company are required.",
    "- salary values must be integer cents when present.",
    "- salaryPeriod must be year, month, or hour.",
    "- tags must contain concise labels only.",
    "- noteBlocks should contain free-form information that does not map to structured fields.",
    "- If an extraction tag has no metadata, prefer placing the extracted information in noteBlocks.",
    "- description must be plain text only.",
  ].join("\n");
}
