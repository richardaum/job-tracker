import { Injectable, NotFoundException } from "@nestjs/common";
import { ApplicationRepository } from "./applications.repository";
import { Application } from "./applications.schema";

type CreateDto = {
  title: string;
  company: string;
  url?: string | null;
  appliedAt: Date;
};
type UpdateDto = Partial<CreateDto>;

@Injectable()
export class ApplicationService {
  constructor(private readonly repo: ApplicationRepository) {}

  findAll(userId: string): Promise<Application[]> {
    return this.repo.findAllByUserId(userId);
  }

  async findOne(id: string, userId: string): Promise<Application> {
    const app = await this.repo.findOneByIdAndUserId(id, userId);
    if (!app) throw new NotFoundException(`Application ${id} not found`);
    return app;
  }

  create(userId: string, dto: CreateDto): Promise<Application> {
    return this.repo.create(userId, dto);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateDto,
  ): Promise<Application> {
    await this.findOne(id, userId);
    const updated = await this.repo.update(id, userId, dto);
    if (!updated) throw new NotFoundException(`Application ${id} not found`);
    return updated;
  }

  async remove(id: string, userId: string): Promise<Application> {
    await this.findOne(id, userId);
    const deleted = await this.repo.delete(id, userId);
    if (!deleted) throw new NotFoundException(`Application ${id} not found`);
    return deleted;
  }
}
