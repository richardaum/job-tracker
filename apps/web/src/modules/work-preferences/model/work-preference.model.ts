import { type PreferenceInput, Weight } from "@/gql/hooks";

export interface LocalPreference {
  id: string;
  text: string;
  weight: Weight;
}

let prefIdCounter = 0;

export function nextPrefId(): string {
  prefIdCounter += 1;
  return `pref-${prefIdCounter}`;
}

export function toLocal(
  items: readonly { text: string; weight: Weight }[],
): LocalPreference[] {
  return items.map((p) => ({
    id: nextPrefId(),
    text: p.text,
    weight: p.weight,
  }));
}

export function toPreferenceInput(
  items: readonly LocalPreference[],
): PreferenceInput[] {
  return items
    .filter((p) => p.text.trim().length > 0)
    .map((p) => ({ text: p.text.trim(), weight: p.weight }));
}

export function weightLabel(weight: Weight): string {
  return weight === Weight.High ? "High" : "Low";
}
