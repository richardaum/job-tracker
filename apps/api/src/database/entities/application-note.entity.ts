import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

const EMPTY_TIPTAP_DOC = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

@WithGeneratedId()
@Entity({ name: "application_notes" })
export class ApplicationNoteEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "application_id", type: "text" })
  applicationId!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ type: "text", default: EMPTY_TIPTAP_DOC })
  content!: string;

  @Column({ type: "int", default: 1 })
  revision!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
