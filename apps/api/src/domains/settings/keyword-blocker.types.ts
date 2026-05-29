import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";

export enum KeywordScope {
  TITLE = "TITLE",
  DESCRIPTION = "DESCRIPTION",
  COMPANY = "COMPANY",
}

registerEnumType(KeywordScope, { name: "KeywordScope" });

export enum MatchMode {
  PARTIAL = "PARTIAL",
  EXACT = "EXACT",
}

registerEnumType(MatchMode, { name: "MatchMode" });

export interface BlockedKeyword {
  keyword: string;
  scope: KeywordScope;
  matchMode: MatchMode;
}

@ObjectType("BlockedKeyword")
export class BlockedKeywordType {
  @Field()
  keyword!: string;

  @Field(() => KeywordScope)
  scope!: KeywordScope;

  @Field(() => MatchMode)
  matchMode!: MatchMode;
}

@InputType("BlockedKeywordInput")
export class BlockedKeywordInput {
  @Field()
  keyword!: string;

  @Field(() => KeywordScope)
  scope!: KeywordScope;

  @Field(() => MatchMode)
  matchMode!: MatchMode;
}
