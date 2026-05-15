import { DatabaseModule } from "@api/database/database.module";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { ApplicationModule } from "@api/domains/applications/applications.module";
import { AuthModule } from "@api/domains/auth/auth.module";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { NoteGenerationService } from "./ai/note-generation.service";
import { NoteRepository } from "./notes.repository";
import { NoteResolver } from "./notes.resolver";
import { NoteService } from "./notes.service";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([ApplicationEntity, ApplicationNoteEntity]),
    ApplicationModule,
    AuthModule,
    LibAiModule,
  ],
  providers: [NoteRepository, NoteService, NoteResolver, NoteGenerationService],
  exports: [NoteService, NoteGenerationService],
})
export class NotesModule {}
