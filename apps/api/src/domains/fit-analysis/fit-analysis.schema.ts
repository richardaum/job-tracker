import type { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import type { AsyncMetadataType } from "@api/domains/shared/async-metadata.type";

export type FitAnalysis = Omit<
  FitAnalysisEntity,
  "setId" | "generationMetadata"
> & { generationMetadata?: AsyncMetadataType | null };

export type NewFitAnalysis = Partial<
  Omit<FitAnalysisEntity, "id" | "createdAt" | "updatedAt" | "setId">
> &
  Pick<
    Partial<FitAnalysisEntity>,
    "applicationId" | "draftApplicationId" | "resumeId"
  >;
