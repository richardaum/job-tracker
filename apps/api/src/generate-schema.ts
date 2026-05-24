import "reflect-metadata";

import { AppModule } from "@api/app.module";
import { NestFactory } from "@nestjs/core";
import { join } from "path";

async function main() {
  process.stdout.write("Booting NestJS to generate schema.gql...\n");

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn"],
  });

  const schemaPath = join(process.cwd(), "src/schema.gql");
  process.stdout.write(`Generated ${schemaPath}\n`);

  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
