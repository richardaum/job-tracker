import { apolloGraphOsPlugins } from "@api/graphql/apollo-graphos-plugins";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloDriver } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ThrottlerModule } from "@nestjs/throttler";
import type { Request } from "express";
import { join } from "path";

import { AppController } from "./app.controller";
import { DatabaseModule } from "./database/database.module";
import { AiChatModule } from "./domains/ai-chat/ai-chat.module";
import { AiModule } from "./domains/ai/ai.module";
import { AuthModule } from "./domains/auth/auth.module";
import { CompaniesModule } from "./domains/companies/companies.module";
import { CurrencyConverterModule } from "./domains/currency-converter/currency-converter.module";
import { ExtensionActivityModule } from "./domains/extension-activity/extension-activity.module";
import { FeatureFlagsModule } from "./domains/feature-flags/feature-flags.module";
import { JobsModule } from "./domains/jobs/jobs.module";
import { MatchAnalysisModule } from "./domains/match-analysis/match-analysis.module";
import { NotesModule } from "./domains/notes/notes.module";
import { ResumesModule } from "./domains/resumes/resumes.module";
import { SettingsModule } from "./domains/settings/settings.module";
import { SourcesModule } from "./domains/sources/sources.module";
import { WorkPreferencesModule } from "./domains/work-preferences/work-preferences.module";
import { apiEnv } from "./env/server";
import { fixSubscriptionResolve } from "./graphql/fix-subscription-resolve";
import { graphqlFormatError } from "./graphql/graphql-format-error";
import { createWsSubscribe } from "./graphql/graphql-ws-logger";

@Module({
  imports: [
    // TODO(infra): Remove ThrottlerModule when WAF/CloudFront rate limits replace in-app auth throttling.
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 20 }], skipIf: () => apiEnv.RATE_LIMIT_DISABLED }),
    DatabaseModule,
    FeatureFlagsModule,
    AuthModule,
    JobsModule,
    CompaniesModule,
    CurrencyConverterModule,
    SourcesModule,
    ExtensionActivityModule,
    NotesModule,
    ResumesModule,
    SettingsModule,
    WorkPreferencesModule,
    MatchAnalysisModule,
    AiChatModule,
    AiModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      playground: true,
      plugins: apolloGraphOsPlugins(),
      formatError: graphqlFormatError,
      subscriptions: {
        "graphql-ws": { path: "/graphql", subscribe: createWsSubscribe() } as Record<string, unknown> & {
          path: string;
        },
      },
      transformSchema: fixSubscriptionResolve,
      context: (ctx: { req?: Request; connectionParams?: Record<string, unknown>; extra?: { request: Request } }) => ({
        req: ctx.req ?? ctx.extra?.request,
      }),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
