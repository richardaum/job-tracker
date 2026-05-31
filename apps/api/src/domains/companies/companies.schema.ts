import type { CompanyEntity } from "@api/database/entities/company.entity";

export type Company = Omit<CompanyEntity, "applications">;

export type NewCompany = Partial<Omit<CompanyEntity, "id" | "createdAt" | "updatedAt" | "applications">> &
  Pick<CompanyEntity, "name" | "userId">;
