import { PlanEntity } from "@api/database/entities/plan.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class PlanRepository {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly repo: Repository<PlanEntity>,
  ) {}

  findAll(userId: string): Promise<PlanEntity[]> {
    return this.repo.find({ where: { userId }, order: { displayName: "ASC" } });
  }

  findById(id: string): Promise<PlanEntity | null> {
    return this.repo.findOneBy({ id });
  }

  create(params: { displayName: string; document: PlanEntity["document"]; userId: string }): Promise<PlanEntity> {
    const row = this.repo.create(params);
    return this.repo.save(row);
  }

  async update(
    id: string,
    userId: string,
    params: Partial<Pick<PlanEntity, "displayName" | "document">>,
  ): Promise<PlanEntity | null> {
    const result = await this.repo.update({ id, userId }, params as Parameters<Repository<PlanEntity>["update"]>[1]);
    if ((result.affected ?? 0) === 0) {
      return null;
    }
    return this.findById(id);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.repo.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }
}
