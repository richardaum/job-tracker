/** DTO for creating a draft capture (no longer a GraphQL input type). */
export type CreateDraftJobInput = {
  title: string;
  url?: string | null;
  htmlContent: string;
};
