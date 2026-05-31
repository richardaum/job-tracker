import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";

export enum KeywordScopeEnum {
  Title = "Title",
  Description = "Description",
  Company = "Company",
}

registerEnumType(KeywordScopeEnum, { name: "KeywordScope" });

export enum MatchModeEnum {
  Partial = "Partial",
  Exact = "Exact",
}

registerEnumType(MatchModeEnum, { name: "MatchMode" });

export interface BlockedKeyword {
  keyword: string;
  scope: KeywordScopeEnum;
  matchMode: MatchModeEnum;
}

@ObjectType("BlockedKeyword")
export class BlockedKeywordType {
  @Field()
  keyword!: string;

  @Field(() => KeywordScopeEnum)
  scope!: KeywordScopeEnum;

  @Field(() => MatchModeEnum)
  matchMode!: MatchModeEnum;
}

@InputType("BlockedKeywordInput")
export class BlockedKeywordInput {
  @Field()
  keyword!: string;

  @Field(() => KeywordScopeEnum)
  scope!: KeywordScopeEnum;

  @Field(() => MatchModeEnum)
  matchMode!: MatchModeEnum;
}
