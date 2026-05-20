import { beforeEach, describe, expect, it } from "vitest";

import { TagService } from "./tag.service";

describe("TagService", () => {
  let tagService: TagService;

  beforeEach(() => {
    tagService = new TagService();
  });

  describe("normalizeTags", () => {
    it("returns empty array for null/undefined", () => {
      expect(tagService.normalizeTags(null)).toEqual([]);
      expect(tagService.normalizeTags(undefined)).toEqual([]);
    });

    it("trims and removes duplicates (case-insensitive keys)", () => {
      expect(
        tagService.normalizeTags([" React ", "react", " TypeScript "]),
      ).toEqual(["React", "TypeScript"]);
    });

    it("limits count and length", () => {
      const longTag = "a".repeat(100);
      const result = tagService.normalizeTags([longTag]);
      expect(result[0]).toHaveLength(32);

      const manyTags = Array.from({ length: 20 }, (_, i) => `tag${i}`);
      expect(tagService.normalizeTags(manyTags)).toHaveLength(8);
    });
  });
});
