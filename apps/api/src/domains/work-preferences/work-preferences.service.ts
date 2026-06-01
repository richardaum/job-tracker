import { Injectable } from "@nestjs/common";

import { WeightEnum } from "./weight.enum";
import { WorkPreferencesRepository } from "./work-preferences.repository";

interface PreferenceItemDto {
  text: string;
  weight: WeightEnum;
}

@Injectable()
export class WorkPreferencesService {
  constructor(private readonly repo: WorkPreferencesRepository) {}

  async findPreferences(userId: string): Promise<PreferenceItemDto[]> {
    const prefs = await this.repo.findByUserId(userId);
    if (!prefs) {
      return [];
    }
    return prefs.items;
  }

  async updatePreferences(userId: string, items: PreferenceItemDto[]): Promise<PreferenceItemDto[]> {
    await this.repo.upsert(userId, items);
    return items;
  }
}
