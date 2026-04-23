# Product Scope: ai-assistance

## Objective

- [P-43] Help users make better application decisions with AI-generated insights and AI-assisted note structuring.

## In Scope

- [P-44] Generate job insight cards covering summary, candidate fit signal, skills gaps, and interview preparation suggestions.
- [P-45] Convert raw interview notes into structured sections before user confirmation and persistence.
- [P-46] Store user-approved AI output as part of the owned application timeline with traceable provenance metadata.
- [P-74] Route AI generation through stable internal provider facades to keep model integrations swappable and governable.
- [P-75] Enforce prompt templates and output schemas per AI use case to increase deterministic and reviewable responses.
- [P-76] Separate AI generation from persistence so user confirmation remains mandatory before write operations.

## Out of Scope

- [P-47] Autonomous messaging or autonomous application submission to external systems.
- [P-48] Model fine-tuning pipelines and custom training datasets in Beta2.
- [P-77] Automatic persistence of AI-generated updates without explicit user approval.

## Acceptance Criteria

- [P-49] A user can request AI insights for an owned application and receive a structured response.
- [P-50] A user can review, edit, and approve AI-structured notes before save.
- [P-51] Persisted AI-generated fields indicate source metadata and approval state for audit review.
- [P-78] AI flows meet schema-compliance and timeout handling checks with observable approval-only persistence behavior.
