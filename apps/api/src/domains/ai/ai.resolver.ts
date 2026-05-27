import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { RoleEnum } from "@api/domains/users/role.enum";
import { RestructureJDService, RewriteTextService } from "@api/lib/ai";
import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class AiResolver {
  constructor(
    private readonly rewriteTextService: RewriteTextService,
    private readonly restructureJDService: RestructureJDService,
  ) {}

  @Query(() => String)
  rewriteTextWithAI(@Args("text") text: string): Promise<string> {
    return this.rewriteTextService.rewriteTextAsSingleParagraph(text);
  }

  @Query(() => String)
  restructureJobDescriptionWithAI(@Args("text") text: string): Promise<string> {
    return this.restructureJDService.restructureJobDescription(text);
  }
}
