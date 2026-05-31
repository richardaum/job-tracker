import { isTipTapDocumentString } from "@job-tracker/tiptap";
import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration to ensure all company descriptions are valid TipTap JSON strings.
 * If a description is plain text, it will be wrapped in a TipTap paragraph structure.
 */
export class EnsureCompanyDescriptionTiptap1750000000000 implements MigrationInterface {
  name = "EnsureCompanyDescriptionTiptap1750000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const companies = await queryRunner.query(`SELECT id, description FROM "companies" WHERE description IS NOT NULL`);

    for (const company of companies) {
      const { id, description } = company;

      if (!isTipTapDocumentString(description)) {
        const tiptapDoc = this.plainTextToTipTap(description);
        await queryRunner.query(`UPDATE "companies" SET description = $1 WHERE id = $2`, [tiptapDoc, id]);
      }
    }
  }

  public async down(): Promise<void> {
    // Migration is one-way as converting TipTap back to plain text is lossy
    // and not strictly required for a "down" operation in this context.
  }

  private plainTextToTipTap(input: string): string {
    const paragraphs = input
      .split("\n")
      .map((line) => line.trimEnd())
      .filter((line) => line.length > 0)
      .map((line) => ({ type: "paragraph", content: [{ type: "text", text: line }] }));

    if (paragraphs.length === 0) {
      return JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });
    }

    return JSON.stringify({ type: "doc", content: paragraphs });
  }
}
