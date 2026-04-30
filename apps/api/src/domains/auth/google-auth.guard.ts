import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";
import { getSafeReturnTo } from "@api/domains/auth/auth-return-to.util";

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  getAuthenticateOptions(context: ExecutionContext): { state?: string } {
    const request = context.switchToHttp().getRequest<Request>();
    const returnTo = getSafeReturnTo(request.query.returnTo);

    return returnTo ? { state: returnTo } : {};
  }
}
