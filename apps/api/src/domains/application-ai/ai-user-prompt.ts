export function buildApplicationAiUserPrompt(input: {
  prompt: string;
  tagsJson: string;
}): string {
  return [
    "A job description follows.",
    "Job description:",
    input.prompt,
    "",
    "Extraction tags in JSON:",
    input.tagsJson,
  ].join("\n");
}
