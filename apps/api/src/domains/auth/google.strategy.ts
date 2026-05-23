import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import { serverEnv } from "@api/env/server";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly userService: UserService) {
    super({
      clientID: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
      callbackURL: serverEnv.GOOGLE_CALLBACK_URL,
      scope: ["email", "profile"],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    return this.userService.findOrCreateFromGoogle({
      googleId: profile.id,
      email: profile.emails![0].value,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    });
  }
}
