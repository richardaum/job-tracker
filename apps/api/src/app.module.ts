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
import { ExtensionChannelModule } from "./domains/extension-channel/extension-channel.module";
import { GraphqlSseMiddleware } from "./domains/extension-channel/graphql-sse.middleware";
import {
  GRAPHQL_SSE_PATH,
  GraphqlSseSetupService,
} from "./domains/extension-channel/graphql-sse-setup.service";
import { ImportsModule } from "./domains/imports/imports.module";
import { NotesModule } from "./domains/notes/notes.module";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ApplicationModule,
    CompaniesModule,
    ImportsModule,
    NotesModule,
    AiModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      playground: false,
    }),
    ExtensionChannelModule,
  ],
  controllers: [AppController],
  providers: [GraphqlSseSetupService, GraphqlSseMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    const streamPath = GRAPHQL_SSE_PATH.replace(/^\//, "");
    consumer
      .apply(GraphqlSseMiddleware)
      .forRoutes({ path: streamPath, method: RequestMethod.ALL });
  }
}
