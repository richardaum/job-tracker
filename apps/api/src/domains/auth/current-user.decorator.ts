import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    return gqlCtx.getContext<{ req: { user: { userId: string } } }>().req.user;
  },
);
