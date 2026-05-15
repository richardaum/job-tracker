import { Module } from "@nestjs/common";

import { SalaryResolver } from "./salary.resolver";
import { SalaryService } from "./salary.service";

@Module({
  providers: [SalaryResolver, SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}
