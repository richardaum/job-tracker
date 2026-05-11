import { Injectable } from "@nestjs/common";

import { UserPreferencesRepository } from "./user-preferences.repository";
import { WeightEnum } from "./weight.enum";

interface PreferenceItemDto {
  text: string;
  weight: WeightEnum;
}

@Injectable()
export class UserPreferencesService {
  constructor(private readonly repo: UserPreferencesRepository) {}

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
