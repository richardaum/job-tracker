import { AiConversationEntity } from "@api/database/entities/ai-conversation.entity";
import { AiMessageEntity } from "@api/database/entities/ai-message.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { JobsModule } from "@api/domains/jobs/jobs.module";
import { MatchAnalysisModule } from "@api/domains/match-analysis/match-analysis.module";
import { NotesModule } from "@api/domains/notes/notes.module";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AiChatPubSub } from "./ai-chat.pubsub";
import { AiChatGenerationService } from "./ai-chat-generation.service";
import { AiChatRepository } from "./ai-chat.repository";
import { AiChatResolver } from "./ai-chat.resolver";
import { AiChatService } from "./ai-chat.service";
import { AiChatEventListener } from "./ai-chat-event.listener";

@Module({
  imports: [
    TypeOrmModule.forFeature([AiConversationEntity, AiMessageEntity]),
    AuthModule,
    JobsModule,
    NotesModule,
    MatchAnalysisModule,
    LibAiModule,
  ],
  providers: [
    AiChatPubSub,
    AiChatRepository,
    AiChatService,
    AiChatResolver,
    AiChatGenerationService,
    AiChatEventListener,
  ],
})
export class AiChatModule {}
