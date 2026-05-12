import type { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";

export type FitAnalysis = Omit<FitAnalysisEntity, "setId">;

export type NewFitAnalysis = Partial<
  Omit<FitAnalysisEntity, "id" | "createdAt" | "updatedAt" | "setId">
> &
  Pick<FitAnalysisEntity, "applicationId" | "resumeId">;
