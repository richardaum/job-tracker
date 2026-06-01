import { registerEnumType } from "@nestjs/graphql";

/** Identity provider for the linked account (DB + GraphQL). */
export enum AuthProviderEnum {
  Google = "Google",
}

registerEnumType(AuthProviderEnum, { name: "AuthProvider" });
