"use client";

import {
  ArrowsClockwiseIcon,
  ArrowSquareOutIcon,
  BriefcaseIcon,
  BuildingsIcon,
  ClipboardTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FilesIcon,
  GearIcon,
  LinkIcon,
  ListIcon,
  PencilSimpleIcon,
  SignOutIcon,
  SparkleIcon,
  StarIcon,
  SuitcaseIcon,
  TextAlignLeftIcon,
  TextTIcon,
  TrashIcon,
  UserIcon,
  XIcon,
} from "@phosphor-icons/react";

/**
 * Canonical icon map by semantic concept.
 *
 * When you need an icon for a known concept, import from here instead of
 * reaching for a Phosphor icon directly.  This keeps the codebase consistent
 * — the same concept always maps to the same icon.
 *
 * If a concept is missing, add it here first.
 */
export const conceptIcon = {
  /** Job/vaga */
  job: SuitcaseIcon,

  /** Work preferences */
  workPreference: BriefcaseIcon,

  /** Company/empresa */
  company: BuildingsIcon,

  /** Resume/currículo, document */
  resume: FilesIcon,

  /** Edit/editar */
  edit: PencilSimpleIcon,

  /** Delete, remove */
  delete: TrashIcon,

  /** Open / navigate to detail, external link */
  externalLink: ArrowSquareOutIcon,

  /** URL, link, surface URL */
  url: LinkIcon,

  /** Schedule, date, time */
  schedule: ClockIcon,

  /** Refresh, reload, regenerate */
  refresh: ArrowsClockwiseIcon,

  /** User, profile */
  user: UserIcon,

  /** Sign out, log out */
  signOut: SignOutIcon,

  /** Star, favorite, default, nice-to-have */
  star: StarIcon,

  /** Settings, configuration */
  settings: GearIcon,

  /** AI, sparkle, generation */
  ai: SparkleIcon,

  /** Money, salary, currency */
  money: CurrencyDollarIcon,

  /** Title / heading */
  title: TextTIcon,

  /** Description / content body */
  description: TextAlignLeftIcon,

  /** Paste content from the clipboard */
  paste: ClipboardTextIcon,

  /** Close or dismiss */
  close: XIcon,

  /** List / all items */
  list: ListIcon,
} as const;
