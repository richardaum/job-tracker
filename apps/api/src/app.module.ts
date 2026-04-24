import { join } from "path";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver } from "@nestjs/apollo";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { AppController } from "./app.controller";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./domains/auth/auth.module";
import { ApplicationModule } from "./domains/applications/applications.module";
import { CompaniesModule } from "./domains/companies/companies.module";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ApplicationModule,
    CompaniesModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      playground: false,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
