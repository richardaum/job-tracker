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

@Entity({ name: "resumes" })
export class ResumeEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ type: "text" })
  title!: string;

  @Column({ type: "text", default: EMPTY_TIPTAP_DOC })
  content!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @Column({ name: "is_default", type: "boolean", default: false })
  isDefault!: boolean;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
