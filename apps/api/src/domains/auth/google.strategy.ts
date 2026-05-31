import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import { apiEnv } from "@api/env/server";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly userService: UserService) {
    super({
      clientID: apiEnv.GOOGLE_CLIENT_ID,
      clientSecret: apiEnv.GOOGLE_CLIENT_SECRET,
      callbackURL: apiEnv.GOOGLE_CALLBACK_URL,
      scope: ["email", "profile"],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<User> {
    const user = await this.userService.findOrCreateFromGoogle({
      googleId: profile.id,
      email: profile.emails![0].value,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    });
    if (!user.active) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
