import { UserTourProgressEntity } from "@api/database/entities/user-tour-progress.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { SaveTourProgressDto, TourProgress } from "./tour-progress.schema";

@Injectable()
export class TourProgressRepository {
  constructor(
    @InjectRepository(UserTourProgressEntity)
    private readonly repo: Repository<UserTourProgressEntity>,
  ) {}

  async findByUserAndTourId(userId: string, tourId: string): Promise<TourProgress | null> {
    return this.repo.findOne({ where: { userId, tourId } });
  }

  create(userId: string, dto: SaveTourProgressDto): TourProgress {
    return this.repo.create({ userId, ...dto });
  }

  async save(progress: TourProgress): Promise<TourProgress> {
    return this.repo.save(progress);
  }
}
