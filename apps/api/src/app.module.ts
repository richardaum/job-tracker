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
import { join } from "path";

import { AppController } from "./app.controller";
import { DatabaseModule } from "./database/database.module";
import { AiModule } from "./domains/ai/ai.module";
import { ApplicationModule } from "./domains/applications/applications.module";
import { AuthModule } from "./domains/auth/auth.module";
import { CompaniesModule } from "./domains/companies/companies.module";
import { CurrencyConverterModule } from "./domains/currency-converter/currency-converter.module";
import { DraftApplicationsModule } from "./domains/draft-applications/draft-applications.module";
import { ImportsModule } from "./domains/imports/imports.module";
import { NotesModule } from "./domains/notes/notes.module";
import { ResumesModule } from "./domains/resumes/resumes.module";
import { UserPreferencesModule } from "./domains/user-preferences/user-preferences.module";
import { GraphqlSseMiddleware } from "./graphql/graphql-sse.middleware";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ApplicationModule,
    CompaniesModule,
    CurrencyConverterModule,
    ImportsModule,
    DraftApplicationsModule,
    NotesModule,
    ResumesModule,
    UserPreferencesModule,
    AiModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      playground: true,
      plugins: apolloGraphOsPlugins(),
    }),
  ],
  controllers: [AppController],
  providers: [GraphqlSseMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(GraphqlSseMiddleware)
      .forRoutes({ path: "graphql-sse/stream", method: RequestMethod.ALL });
  }
}
