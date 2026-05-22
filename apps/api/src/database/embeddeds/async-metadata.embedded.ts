import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { Column } from "typeorm";

export class AsyncMetadataEmbedded {
  @Column({ type: "text", nullable: true })
  status!: AsyncMetadataStatusEnum | null;

  @Column({ type: "text", nullable: true })
  error!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  timestamp!: Date | null;
}
