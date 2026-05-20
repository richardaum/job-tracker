import type { JobNoteEntity } from "@api/database/entities/job-note.entity";

export type Note = Omit<JobNoteEntity, "setId">;

export type NewNote = Pick<JobNoteEntity, "jobId" | "userId" | "content">;
