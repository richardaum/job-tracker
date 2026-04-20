import { Injectable } from "@nestjs/common";
import { UserRepository } from "./users.repository";
import { User } from "./users.schema";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findOrCreateFromGoogle(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }): Promise<User> {
    return this.userRepository.upsert(profile);
  }
}
