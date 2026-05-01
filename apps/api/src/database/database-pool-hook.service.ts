import { DatabasePoolInterceptor } from "@api/observability/database-pool.interceptor";
import { Injectable, OnModuleInit } from "@nestjs/common";
import type { Pool } from "pg";
import { DataSource } from "typeorm";
import type { PostgresDriver } from "typeorm/driver/postgres/PostgresDriver";

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
