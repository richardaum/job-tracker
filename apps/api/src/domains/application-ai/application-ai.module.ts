import { Module } from "@nestjs/common";
import { ApplicationAiService } from "./application-ai.service";
import { OpenAIService } from "./openai.service";

@Module({
  providers: [OpenAIService, ApplicationAiService],
  exports: [ApplicationAiService, OpenAIService],
})
export class ApplicationAiModule {}
