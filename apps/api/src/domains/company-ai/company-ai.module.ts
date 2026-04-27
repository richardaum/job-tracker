import { Module } from "@nestjs/common";
import { OpenAIService } from "@api/domains/application-ai/openai.service";
import { CompanyAiService } from "./company-ai.service";

@Module({
  providers: [OpenAIService, CompanyAiService],
  exports: [CompanyAiService],
})
export class CompanyAiModule {}
