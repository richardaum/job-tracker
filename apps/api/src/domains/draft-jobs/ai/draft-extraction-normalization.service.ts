import { SalaryEmbedded } from "@api/database/embeddeds/salary.embedded";
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
  salary: SalaryEmbedded;
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
    return {
      title: this.normalizeDraftTitle(raw),
      company: this.normalizeDraftCompany(raw),
      description: this.normalizeDraftDescription(raw),
      salary: this.normalizeDraftSalaryFields(raw),
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
  ): SalaryEmbedded {
    const embedded = new SalaryEmbedded();
    const salary = asRecord(raw.salary);
    if (salary) {
      embedded.minCents = salaryMajorUnitsToCents(salary.min);
      embedded.maxCents = salaryMajorUnitsToCents(salary.max);
      embedded.currency = asOptionalCurrency(salary.currency);
      embedded.period = asSalaryPeriod(salary.period);
    } else {
      embedded.minCents = asOptionalInt(raw.salaryMinCents);
      embedded.maxCents = asOptionalInt(raw.salaryMaxCents);
      embedded.currency = asOptionalCurrency(raw.salaryCurrency);
      embedded.period = asSalaryPeriod(raw.salaryPeriod);
    }
    return embedded;
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
