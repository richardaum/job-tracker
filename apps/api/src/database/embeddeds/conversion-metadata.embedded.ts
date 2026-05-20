import { DraftApplicationConversionStatusEnum } from "@api/database/entities/draft-application.entity";
import { Column } from "typeorm";

export class ConversionMetadataEmbedded {
  @Column({ type: "text", nullable: true })
  status!: DraftApplicationConversionStatusEnum | null;

  @Column({ type: "text", nullable: true })
  error!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  timestamp!: Date | null;
}
