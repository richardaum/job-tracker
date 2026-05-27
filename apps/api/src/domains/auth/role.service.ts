import { RoleEnum } from "@api/domains/users/role.enum";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RoleService {
  isAllowed(userRole: RoleEnum, allowedRoles: RoleEnum[]): boolean {
    return userRole === RoleEnum.Admin || allowedRoles.includes(userRole);
  }
}
