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
    return prefs.items.map((item) => ({
      text: item.text,
      weight: item.weight === "high" ? WeightEnum.HIGH : WeightEnum.LOW,
    }));
  }

  async updatePreferences(
    userId: string,
    items: PreferenceItemDto[],
  ): Promise<PreferenceItemDto[]> {
    const dbItems = items.map((item) => ({
      text: item.text,
      weight:
        item.weight === WeightEnum.HIGH ? ("high" as const) : ("low" as const),
    }));
    await this.repo.upsert(userId, dbItems);
    return items;
  }
}
