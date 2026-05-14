export const LOCATION_INFERENCE_SYSTEM_TEMPLATE = `### Role
Location data extractor for job postings.

### Task
Given a job description, extract the job location (city/state/country where the role is based).

### Output format
Return a SINGLE JSON object:
{ "value": string | null }
- value: e.g. "São Paulo, SP", "San Francisco, CA", or null if not found

Return ONLY the JSON object. No prose.
`;

export const LOCATION_INFERENCE_USER_TEMPLATE = `Job description:
{{{description}}}
`;

export const WORK_REGION_INFERENCE_SYSTEM_TEMPLATE = `### Role
Work region data extractor for job postings.

### Task
Given a job description, extract the geographic area the candidate can work from.

### Output format
Return a SINGLE JSON object:
{ "value": string | null }
- value: e.g. "Brazil", "Latam", "Anywhere", "EST timezone", or null if not found

Return ONLY the JSON object. No prose.
`;

export const WORK_REGION_INFERENCE_USER_TEMPLATE = `Job description:
{{{description}}}
`;
