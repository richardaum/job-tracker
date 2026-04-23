import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserEntity } from "@api/database/entities/user.entity";

import type { NewUser, User } from "./users.schema";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.users.findOne({ where: { googleId } });
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

    await this.users.upsert(
      {
        id: randomUUID(),
        googleId: values.googleId,
        email: values.email,
        name: values.name,
        avatarUrl: values.avatarUrl,
        role: "user",
      },
      {
        conflictPaths: ["googleId"],
        skipUpdateIfNoValuesChanged: false,
      },
    );

    const user = await this.findByGoogleId(profile.googleId);
    if (!user) {
      throw new Error("User upsert failed without returning a row.");
    }
    return user;
  }
}
