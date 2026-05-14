export interface PdfExportConfig {
  getFileName: (date: Date) => string;
}

export function defaultGetFileName(date: Date): string {
  const dateSuffix = date.toISOString().slice(0, 10);
  const pageTitle = window.document.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!pageTitle) {
    return `document-export-${dateSuffix}`;
  }

  return `${pageTitle}-${dateSuffix}`;
}
