import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DatabaseService } from "@api/database/database.service";
import {
  applications,
  Application,
  NewApplication,
} from "./applications.schema";

type CreateDto = Pick<
  NewApplication,
  "title" | "company" | "url" | "appliedAt"
>;
type UpdateDto = Partial<CreateDto>;

@Injectable()
export class ApplicationRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAllByUserId(userId: string): Promise<Application[]> {
    return this.db.db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));
  }

  async findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Application | null> {
    const result = await this.db.db
      .select()
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .limit(1);
    return result[0] ?? null;
  }

  async create(userId: string, dto: CreateDto): Promise<Application> {
    const result = await this.db.db
      .insert(applications)
      .values({ userId, ...dto })
      .returning();
    return result[0];
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateDto,
  ): Promise<Application | null> {
    const result = await this.db.db
      .update(applications)
      .set({ ...dto, updatedAt: new Date() })
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string, userId: string): Promise<Application | null> {
    const result = await this.db.db
      .delete(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .returning();
    return result[0] ?? null;
  }
}
