import { DraftJobConversionStatusEnum } from "@api/database/entities/draft-job-conversion.enum";
import { Column } from "typeorm";

export class ConversionMetadataEmbedded {
  @Column({ type: "text", nullable: true })
  status!: DraftJobConversionStatusEnum | null;

  @Column({ type: "text", nullable: true })
  error!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  timestamp!: Date | null;
}
