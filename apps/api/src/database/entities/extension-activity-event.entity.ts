import { ExtensionActivityEventTypeEnum } from "@api/domains/extension-activity/extension-activity-event-type.enum";
import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "extension_activity_events" })
export class ExtensionActivityEventEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ type: "enum", enum: ExtensionActivityEventTypeEnum, enumName: "extension_activity_event_type" })
  type!: ExtensionActivityEventTypeEnum;

  @Column({ type: "text" })
  summary!: string;

  @Column({ name: "correlation_id", type: "text", nullable: true })
  correlationId!: string | null;

  @Column({ type: "jsonb", nullable: true })
  payload!: Record<string, unknown> | null;

  @Column({ name: "extension_version", type: "text", nullable: true })
  extensionVersion!: string | null;

  @Column({ type: "text", nullable: true })
  browser!: string | null;

  @Column({ name: "occurred_at", type: "timestamptz" })
  occurredAt!: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
