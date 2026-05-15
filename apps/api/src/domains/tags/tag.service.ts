import { Injectable } from "@nestjs/common";

const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 32;

@Injectable()
export class TagService {
  normalizeTags(tags: string[] | null | undefined): string[] {
    if (tags == null || tags.length === 0) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of tags) {
      const t = raw.trim();
      if (!t) continue;
      const key = t.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(t.length > MAX_TAG_LENGTH ? t.slice(0, MAX_TAG_LENGTH) : t);
      if (out.length >= MAX_TAGS) break;
    }
    return out;
  }
}
