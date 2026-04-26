import { type TagWithMetadata } from "@/modules/applications/shared/components/TagsInput";

export const DEFAULT_FIELDS: TagWithMetadata[] = [
  { label: "Title", metadata: "as field value" },
  { label: "Company", metadata: "as field value" },
  { label: "Salary range", metadata: "currency, min, max" },
  { label: "Bonus", metadata: "as tags, bonus, stock options, etc." },
  { label: "Employment benefits", metadata: "PTO, etc." },
  { label: "Job description", metadata: "tiptap format" },
  { label: "Interview process", metadata: "as application note" },
  { label: "Timezone", metadata: "UTC-3, EST, PST, etc., unclear" },
  { label: "Location", metadata: "city, country, etc., unclear" },
  { label: "Tech stack", metadata: "as tags, e.g. React, Node.js, etc." },
  {
    label: "Skillset",
    metadata: "as tags, e.g. frontend heavy, backend heavy, full stack, etc.",
  },
  {
    label: "Work authorization",
    metadata: "as tags, US-only, LATAM, Brazil, anywhere, etc., unclear",
  },
  {
    label: "Work time",
    metadata:
      "as tag, remote-first, fully remote, onsite, hybrid, etc., unclear",
  },
];
