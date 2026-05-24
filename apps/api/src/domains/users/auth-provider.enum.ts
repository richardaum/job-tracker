import { registerEnumType } from "@nestjs/graphql";

/** Identity provider for the linked account (DB + GraphQL). */
export enum AuthProviderEnum {
  GOOGLE = "GOOGLE",
}

registerEnumType(AuthProviderEnum, { name: "AuthProvider" });
