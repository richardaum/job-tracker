import { PlanEntity } from "@api/database/entities/plan.entity";
import { type ExecutorPlanDocument } from "@api/domains/sources/plan.types";
import { Injectable, NotFoundException } from "@nestjs/common";

import { type CreatePlanInput } from "./create-plan.input";
import { PlanRepository } from "./plan.repository";
import { type UpdatePlanInput } from "./update-plan.input";

@Injectable()
export class PlanService {
  constructor(private readonly repo: PlanRepository) {}

  async findAll(userId: string): Promise<PlanEntity[]> {
    return this.repo.findAll(userId);
  }

  async findById(id: string): Promise<PlanEntity> {
    const plan = await this.repo.findById(id);
    if (!plan) {
      throw new NotFoundException(`Plan ${id} not found`);
    }
    return plan;
  }

  async create(input: CreatePlanInput, userId: string): Promise<PlanEntity> {
    return this.repo.create({
      displayName: input.displayName,
      document: input.document as ExecutorPlanDocument,
      userId,
    });
  }

  async update(id: string, input: UpdatePlanInput, userId: string): Promise<PlanEntity> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Plan ${id} not found`);
    }

    const patch: Parameters<PlanRepository["update"]>[2] = {};

    if (input.displayName !== undefined) {
      patch.displayName = input.displayName;
    }
    if (input.document !== undefined) {
      patch.document = input.document as ExecutorPlanDocument;
    }

    const updated = await this.repo.update(id, userId, patch);
    if (!updated) {
      throw new NotFoundException(`Plan ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const deleted = await this.repo.delete(id, userId);
    if (!deleted) {
      throw new NotFoundException(`Plan ${id} not found`);
    }
  }
}
