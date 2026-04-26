import { Injectable, OnModuleInit } from "@nestjs/common";
import { DataSource } from "typeorm";
import type { Pool } from "pg";
import type { PostgresDriver } from "typeorm/driver/postgres/PostgresDriver";

import { DatabasePoolInterceptor } from "@api/observability/database-pool.interceptor";

@Injectable()
export class DatabasePoolHookService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly databasePoolInterceptor: DatabasePoolInterceptor,
  ) {}

  onModuleInit(): void {
    const master = (this.dataSource.driver as PostgresDriver).master;
    if (master && typeof (master as Pool).connect === "function") {
      this.databasePoolInterceptor.install(master as Pool);
    }
  }
}
