import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

export interface PreferenceItem {
  text: string;
  weight: "high" | "low";
}

@WithGeneratedId()
@Entity({ name: "user_preferences" })
@Index("uq_user_preferences_user_id", ["userId"], { unique: true })
export class UserPreferencesEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text", unique: true })
  userId!: string;

  @Column({ name: "items", type: "jsonb", default: [] })
  items!: PreferenceItem[];

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
