import type { MatchAnalysisEntity } from "@api/database/entities/match-analysis.entity";

export type MatchAnalysis = MatchAnalysisEntity;

export type NewMatchAnalysis = Partial<
  Omit<MatchAnalysisEntity, "id" | "createdAt" | "updatedAt">
> &
  Pick<Partial<MatchAnalysisEntity>, "jobId" | "resumeId">;
