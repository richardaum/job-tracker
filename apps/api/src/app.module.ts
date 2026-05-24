import { apolloGraphOsPlugins } from "@api/graphql/apollo-graphos-plugins";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloDriver } from "@nestjs/apollo";
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ThrottlerModule } from "@nestjs/throttler";
import { join } from "path";

import { AppController } from "./app.controller";
import { IpRateLimitService } from "./common/ip-rate-limit.service";
import { DatabaseModule } from "./database/database.module";
import { AiModule } from "./domains/ai/ai.module";
import { AuthModule } from "./domains/auth/auth.module";
import { CompaniesModule } from "./domains/companies/companies.module";
import { CurrencyConverterModule } from "./domains/currency-converter/currency-converter.module";
import { JobsModule } from "./domains/jobs/jobs.module";
import { MatchAnalysisModule } from "./domains/match-analysis/match-analysis.module";
import { NotesModule } from "./domains/notes/notes.module";
import { ResumesModule } from "./domains/resumes/resumes.module";
import { SettingsModule } from "./domains/settings/settings.module";
import { SourcesModule } from "./domains/sources/sources.module";
import { WorkPreferencesModule } from "./domains/work-preferences/work-preferences.module";
import { graphqlFormatError } from "./graphql/graphql-format-error";
import { GraphqlSseMiddleware } from "./graphql/graphql-sse.middleware";

@Module({
  imports: [
    // TODO(infra): Remove ThrottlerModule when WAF/CloudFront rate limits replace in-app auth throttling.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    DatabaseModule,
    AuthModule,
    JobsModule,
    CompaniesModule,
    CurrencyConverterModule,
    SourcesModule,
    NotesModule,
    ResumesModule,
    SettingsModule,
    WorkPreferencesModule,
    MatchAnalysisModule,
    AiModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      playground: true,
      plugins: apolloGraphOsPlugins(),
      formatError: graphqlFormatError,
    }),
  ],
  controllers: [AppController],
  // TODO(infra): Remove IpRateLimitService when SSE (and any /graphql) limits move to the edge.
  providers: [GraphqlSseMiddleware, IpRateLimitService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(GraphqlSseMiddleware)
      .forRoutes({ path: "graphql-sse/stream", method: RequestMethod.ALL });
  }
}
