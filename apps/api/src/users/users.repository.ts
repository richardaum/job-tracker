import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import { users, User, NewUser } from "./users.schema";

@Injectable()
export class UserRepository {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const result = await this.db.db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId))
      .limit(1);
    return result[0] ?? null;
  }

  async upsert(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }): Promise<User> {
    const values: NewUser = {
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
    };

    const result = await this.db.db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.googleId,
        set: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  }
}
