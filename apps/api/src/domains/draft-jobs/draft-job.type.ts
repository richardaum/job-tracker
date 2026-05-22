import type { ConversionMetadataEmbedded } from "@api/database/embeddeds/conversion-metadata.embedded";

/** Internal shape for draft rows (no longer exposed as GraphQL `DraftJobType`). */
export type DraftJobType = {
  id: string;
  url: string | null;
  title: string;
  htmlContent: string;
  jobId: string | null;
  conversionMetadata?: ConversionMetadataEmbedded | null;
  createdAt: Date;
  updatedAt: Date;
};
