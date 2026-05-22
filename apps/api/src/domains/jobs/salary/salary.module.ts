import { Module } from "@nestjs/common";

import { SalaryService } from "./salary.service";

@Module({ providers: [SalaryService], exports: [SalaryService] })
export class SalaryModule {}
