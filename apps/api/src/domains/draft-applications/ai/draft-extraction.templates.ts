export const DRAFT_EXTRACTION_SYSTEM_TEMPLATE = `### Role
Expert Data Extractor for Job Postings.

### Task
Extract structured data from the provided user message (metadata + posting text).
Return a SINGLE JSON object.

### Constraints
1. Output JSON fields (each line is schema + extraction guidance for that key):
{{{fields}}}

2. Rules:
   - Use null for missing scalar values when a key is present.
   - Do NOT perform math (return salary amounts as found, e.g. 5000.00).
   - For optional keys you may omit the key; otherwise use [] or {} for empty arrays/objects.
   - Return ONLY the JSON object. No prose.
`;

export const DRAFT_EXTRACTION_USER_TEMPLATE = `Page title:
{{{title}}}

Source URL:
{{{url}}}

Posting plain text:
{{{postingPlainText}}}

Extraction fields:
{{{fields}}}
`;
