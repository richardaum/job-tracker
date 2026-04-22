import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DATABASE_URL } from "@api/env/server";
import { DatabasePoolInterceptor } from "@api/observability/database-pool.interceptor";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;
  public db!: NodePgDatabase;

  constructor(
    private readonly databasePoolInterceptor: DatabasePoolInterceptor,
  ) {}

  onModuleInit(): void {
    this.pool = new Pool({ connectionString: DATABASE_URL });
    this.databasePoolInterceptor.install(this.pool);
    this.db = drizzle(this.pool);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
