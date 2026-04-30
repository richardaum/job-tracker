import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { AiService } from "./ai.service";

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class AiResolver {
  constructor(private readonly service: AiService) {}

  @Query(() => String)
  rewriteTextWithAI(@Args("text") text: string): Promise<string> {
    return this.service.rewriteTextAsSingleParagraph(text);
  }

  @Query(() => String)
  restructureJobDescriptionWithAI(@Args("text") text: string): Promise<string> {
    return this.service.restructureJobDescription(text);
  }
}
