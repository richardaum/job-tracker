import type { CompanyEntity } from "@api/database/entities/company.entity";

export type Company = Omit<CompanyEntity, "setId" | "applications">;

export type NewCompany = Partial<
  Omit<
    CompanyEntity,
    "id" | "createdAt" | "updatedAt" | "setId" | "applications"
  >
> &
  Pick<CompanyEntity, "name" | "userId">;
