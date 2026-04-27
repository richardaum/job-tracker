import type { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";

export type Note = Omit<ApplicationNoteEntity, "setId">;

export type NewNote = Pick<
  ApplicationNoteEntity,
  "applicationId" | "userId" | "content"
>;
