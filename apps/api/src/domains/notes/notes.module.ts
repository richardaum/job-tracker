import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { DatabaseModule } from "@api/database/database.module";
import { NoteRepository } from "./notes.repository";
import { NoteResolver } from "./notes.resolver";
import { NoteService } from "./notes.service";
import { NoteAiModule } from "@api/domains/note-ai/note-ai.module";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([ApplicationEntity, ApplicationNoteEntity]),
    AuthModule,
    NoteAiModule,
  ],
  providers: [NoteRepository, NoteService, NoteResolver],
  exports: [NoteService],
})
export class NotesModule {}
