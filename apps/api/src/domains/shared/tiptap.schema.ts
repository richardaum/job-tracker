type JsonSchema = Record<string, unknown>;

export const NOTE_AI_STRUCTURED_RESPONSE_SCHEMA: JsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    sections: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          heading: { type: "string" },
          bullets: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
          },
        },
        required: ["heading", "bullets"],
      },
    },
  },
  required: ["sections"],
};
