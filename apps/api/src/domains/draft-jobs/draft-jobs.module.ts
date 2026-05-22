import { Module } from "@nestjs/common";

import { DraftJobsResolver } from "./draft-jobs.resolver";
import { DraftJobsCoreModule } from "./draft-jobs-core.module";
import { DraftJobsSseController } from "./draft-jobs-sse.controller";

/** Wiring for draft SSE + (empty) GraphQL resolver; domain services live in {@link DraftJobsCoreModule}. */
@Module({
  imports: [DraftJobsCoreModule],
  controllers: [DraftJobsSseController],
  providers: [DraftJobsResolver],
})
export class DraftJobsModule {}
