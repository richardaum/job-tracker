import { Module } from "@nestjs/common";
import { ApplicationAiModule } from "@api/domains/application-ai/application-ai.module";
import { NoteAiService } from "./note-ai.service";

@Module({
  imports: [ApplicationAiModule],
  providers: [NoteAiService],
  exports: [NoteAiService],
})
export class NoteAiModule {}
