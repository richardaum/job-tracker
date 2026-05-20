import type { MatchAnalysisEntity } from "@api/database/entities/match-analysis.entity";

export type MatchAnalysis = Omit<MatchAnalysisEntity, "setId">;

export type NewMatchAnalysis = Partial<
  Omit<MatchAnalysisEntity, "id" | "createdAt" | "updatedAt" | "setId">
> &
  Pick<Partial<MatchAnalysisEntity>, "jobId" | "draftJobId" | "resumeId">;
