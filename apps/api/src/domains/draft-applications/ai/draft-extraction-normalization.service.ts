import { SalaryPeriodEnum } from "@api/domains/applications/salary-period.enum";
import { asSalaryPeriod } from "@api/domains/shared/salary-period.util";
import type { TipTapDocument } from "@job-tracker/tiptap";
import {
  isTipTapDocumentString,
  normalizeAITipTapDocument,
  plainTextToTipTap,
} from "@job-tracker/tiptap";
import { Injectable } from "@nestjs/common";

export type NormalizedDraftExtraction = {
  title: string;
  company: string;
  description: string | null;
  salaryMinCents: number | null;
  salaryMaxCents: number | null;
  salaryCurrency: string | null;
  salaryPeriod: SalaryPeriodEnum | null;
  tags: string[];
  location: string | null;
  workRegion: string | null;
};

function asOptionalInt(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function salaryMajorUnitsToCents(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const cleaned = value.trim().replace(/,/g, "");
    const n = Number.parseFloat(cleaned);
    return Number.isFinite(n) ? Math.round(n * 100) : null;
  }
  return null;
}

function asOptionalCurrency(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (
    value !== null &&
    value !== undefined &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }
  return null;
}

@Injectable()
export class DraftExtractionNormalizationService {
  normalizeExtraction(raw: Record<string, unknown>): NormalizedDraftExtraction {
    const salary = this.normalizeDraftSalaryFields(raw);
    return {
      title: this.normalizeDraftTitle(raw),
      company: this.normalizeDraftCompany(raw),
      description: this.normalizeDraftDescription(raw),
      salaryMinCents: salary.salaryMinCents,
      salaryMaxCents: salary.salaryMaxCents,
      salaryCurrency: salary.salaryCurrency,
      salaryPeriod: salary.salaryPeriod,
      tags: this.normalizeDraftTags(raw),
      location: this.normalizeDraftLocation(raw),
      workRegion: this.normalizeDraftWorkRegion(raw),
    };
  }

  private normalizeDraftTitle(raw: Record<string, unknown>): string {
    return String(raw.title ?? "").trim() || "Untitled role";
  }

  private normalizeDraftCompany(raw: Record<string, unknown>): string {
    return String(raw.company ?? "").trim() || "Unknown company";
  }

  private normalizeDraftDescription(
    raw: Record<string, unknown>,
  ): string | null {
    const descRaw = raw.description;
    if (typeof descRaw !== "string" || !descRaw.trim()) return null;
    const d = descRaw.trim();
    if (!isTipTapDocumentString(d)) return plainTextToTipTap(d);

    const parsed = JSON.parse(d) as TipTapDocument;
    const normalized = normalizeAITipTapDocument(parsed);
    return JSON.stringify(normalized);
  }

  private normalizeDraftSalaryFields(
    raw: Record<string, unknown>,
  ): Pick<
    NormalizedDraftExtraction,
    "salaryMinCents" | "salaryMaxCents" | "salaryCurrency" | "salaryPeriod"
  > {
    const salary = asRecord(raw.salary);
    if (salary) {
      return {
        salaryMinCents: salaryMajorUnitsToCents(salary.min),
        salaryMaxCents: salaryMajorUnitsToCents(salary.max),
        salaryCurrency: asOptionalCurrency(salary.currency),
        salaryPeriod: asSalaryPeriod(salary.period),
      };
    }

    return {
      salaryMinCents: asOptionalInt(raw.salaryMinCents),
      salaryMaxCents: asOptionalInt(raw.salaryMaxCents),
      salaryCurrency: asOptionalCurrency(raw.salaryCurrency),
      salaryPeriod: asSalaryPeriod(raw.salaryPeriod),
    };
  }

  private normalizeDraftTags(raw: Record<string, unknown>): string[] {
    const tagsRaw = raw.tags;
    return Array.isArray(tagsRaw)
      ? tagsRaw.filter((t): t is string => typeof t === "string")
      : [];
  }

  private normalizeDraftLocation(raw: Record<string, unknown>): string | null {
    const v = raw.location;
    return typeof v === "string" && v.trim() ? v.trim() : null;
  }

  private normalizeDraftWorkRegion(
    raw: Record<string, unknown>,
  ): string | null {
    const v = raw.workRegion;
    return typeof v === "string" && v.trim() ? v.trim() : null;
  }
}
