import { DatabaseModule } from "@api/database/database.module";
import { JobEntity } from "@api/database/entities/job.entity";
import { JobNoteEntity } from "@api/database/entities/job-note.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { JobsModule } from "@api/domains/jobs/jobs.module";
import { LibAiModule } from "@api/lib/ai";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { NoteGenerationService } from "./ai/note-generation.service";
import { NoteRepository } from "./notes.repository";
import { NoteResolver } from "./notes.resolver";
import { NoteService } from "./notes.service";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([JobEntity, JobNoteEntity]),
    forwardRef(() => JobsModule),
    AuthModule,
    LibAiModule,
  ],
  providers: [NoteRepository, NoteService, NoteResolver, NoteGenerationService],
  exports: [NoteService, NoteGenerationService],
})
export class NotesModule {}
