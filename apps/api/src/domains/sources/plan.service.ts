import { PlanEntity } from "@api/database/entities/plan.entity";
import { type ExecutorPlanDocument } from "@api/domains/sources/source-profiles";
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { type CreatePlanInput } from "./create-plan.input";
import { PlanRepository } from "./plan.repository";
import { type UpdatePlanInput } from "./update-plan.input";

type SourceProfileDescriptorRow = Readonly<{
  sourceProfileId: string;
  name: string;
}>;

@Injectable()
export class PlanService {
  constructor(private readonly repo: PlanRepository) {}

  normalizeSourceProfileKey(rawSourceProfileId: string): string {
    return rawSourceProfileId.trim().toLowerCase();
  }

  async findAll(): Promise<PlanEntity[]> {
    return this.repo.findAll();
  }

  async findById(id: string): Promise<PlanEntity> {
    const plan = await this.repo.findById(id);
    if (!plan) {
      throw new NotFoundException(`Plan ${id} not found`);
    }
    return plan;
  }

  async findBySourceProfileId(
    sourceProfileId: string,
  ): Promise<PlanEntity | null> {
    return this.repo.findBySourceProfileId(sourceProfileId);
  }

  async findPlanDocument(
    sourceProfileId: string,
  ): Promise<ExecutorPlanDocument | undefined> {
    const plan = await this.repo.findBySourceProfileId(sourceProfileId);
    return plan?.document;
  }

  async listSourceProfileDescriptors(): Promise<SourceProfileDescriptorRow[]> {
    const plans = await this.repo.findAll();
    return plans
      .map((p) => ({ sourceProfileId: p.sourceProfileId, name: p.displayName }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
  }

  async create(input: CreatePlanInput): Promise<PlanEntity> {
    const sourceProfileKey = this.normalizeSourceProfileKey(
      input.sourceProfileId,
    );
    const existing = await this.repo.findBySourceProfileId(sourceProfileKey);
    if (existing) {
      throw new ConflictException(
        `Plan for source profile "${sourceProfileKey}" already exists`,
      );
    }
    return this.repo.create({
      sourceProfileId: sourceProfileKey,
      displayName: input.displayName,
      document: input.document as ExecutorPlanDocument,
    });
  }

  async update(id: string, input: UpdatePlanInput): Promise<PlanEntity> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Plan ${id} not found`);
    }

    const patch: Parameters<PlanRepository["update"]>[1] = {};

    if (input.sourceProfileId !== undefined) {
      patch.sourceProfileId = this.normalizeSourceProfileKey(
        input.sourceProfileId,
      );
    }
    if (input.displayName !== undefined) {
      patch.displayName = input.displayName;
    }
    if (input.document !== undefined) {
      patch.document = input.document as ExecutorPlanDocument;
    }

    const updated = await this.repo.update(id, patch);
    if (!updated) {
      throw new NotFoundException(`Plan ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Plan ${id} not found`);
    }
  }
}
