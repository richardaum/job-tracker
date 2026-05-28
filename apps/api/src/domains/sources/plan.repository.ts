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

  findAll(): Promise<PlanEntity[]> {
    return this.repo.find({ order: { displayName: "ASC" } });
  }

  findById(id: string): Promise<PlanEntity | null> {
    return this.repo.findOneBy({ id });
  }

  findBySourceProfileId(sourceProfileId: string): Promise<PlanEntity | null> {
    return this.repo.findOneBy({ sourceProfileId });
  }

  create(params: {
    sourceProfileId: string;
    displayName: string;
    document: PlanEntity["document"];
  }): Promise<PlanEntity> {
    const row = this.repo.create(params);
    return this.repo.save(row);
  }

  async update(
    id: string,
    params: Partial<
      Pick<PlanEntity, "sourceProfileId" | "displayName" | "document">
    >,
  ): Promise<PlanEntity | null> {
    const result = await this.repo.update(
      { id },
      params as Parameters<Repository<PlanEntity>["update"]>[1],
    );
    if ((result.affected ?? 0) === 0) {
      return null;
    }
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
