import { Module } from "@nestjs/common";
import { ApplicationAiService } from "./application-ai.service";

@Module({
  providers: [ApplicationAiService],
  exports: [ApplicationAiService],
})
export class ApplicationAiModule {}
