export const AI_DRAFT_OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    application: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        company: { type: "string" },
        url: { type: ["string", "null"] },
        description: { type: ["string", "null"] },
        salaryCurrency: { type: ["string", "null"] },
        salaryMinCents: { type: ["integer", "null"] },
        salaryMaxCents: { type: ["integer", "null"] },
        salaryPeriod: {
          type: ["string", "null"],
          enum: ["year", "month", "hour", null],
        },
      },
      required: [
        "title",
        "company",
        "url",
        "description",
        "salaryCurrency",
        "salaryMinCents",
        "salaryMaxCents",
        "salaryPeriod",
      ],
    },
    tags: {
      type: "array",
      items: { type: "string" },
    },
    noteBlocks: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["application", "tags", "noteBlocks"],
} as const;
