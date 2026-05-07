import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import { Column, Entity, PrimaryColumn } from "typeorm";

@WithGeneratedId()
@Entity({ name: "imported_applications" })
export class ImportedApplicationEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ type: "text" })
  url!: string;

  @Column({ name: "html_content", type: "text" })
  htmlContent!: string;
}
