import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class BetterAuthAccountRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findProviderIds(userId: string): Promise<string[]> {
    const rows = await this.dataSource.query<{ providerId: string }[]>(
      `SELECT DISTINCT "providerId" AS "providerId" FROM "account" WHERE "userId" = $1::uuid ORDER BY "providerId" ASC`,
      [userId],
    );
    return rows.map((row) => row.providerId);
  }
}
