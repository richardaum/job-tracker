import { DatabaseModule } from "@api/database/database.module";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { ApplicationModule } from "@api/domains/applications/applications.module";
import { AuthModule } from "@api/domains/auth/auth.module";
import { NoteAiModule } from "@api/domains/note-ai/note-ai.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { NoteRepository } from "./notes.repository";
import { NoteResolver } from "./notes.resolver";
import { NoteService } from "./notes.service";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([ApplicationEntity, ApplicationNoteEntity]),
    ApplicationModule,
    AuthModule,
    NoteAiModule,
  ],
  providers: [NoteRepository, NoteService, NoteResolver],
  exports: [NoteService],
})
export class NotesModule {}
