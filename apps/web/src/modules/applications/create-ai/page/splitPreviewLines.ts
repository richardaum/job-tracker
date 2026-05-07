export type PreviewLines = readonly [lineOne: string, lineTwo: string];

const NOISE_LINE_PATTERNS = [
  /^about (the )?role:?$/i,
  /^about (the )?company:?$/i,
  /^job description:?$/i,
  /^responsibilities:?$/i,
  /^requirements:?$/i,
  /^qualifications:?$/i,
  /^preferred qualifications:?$/i,
  /^benefits:?$/i,
  /^how to apply:?$/i,
];

function isNoiseLine(line: string): boolean {
  return NOISE_LINE_PATTERNS.some((pattern) => pattern.test(line));
}

function toSignalLines(value: string): string[] {
  return value
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !isNoiseLine(line));
}

export function splitPreviewLines(value: string): PreviewLines {
  const signalLines = toSignalLines(value);
  if (signalLines.length === 0) return ["(empty paste)", "No text content."];

  if (signalLines.length >= 2) {
    return [signalLines[0], signalLines.slice(1).join(" ")];
  }

  if (signalLines.length === 1) {
    const parts = signalLines[0].split(/\s+/);
    if (parts.length <= 12) return [signalLines[0], "Single-line paste."];
    return [parts.slice(0, 12).join(" "), parts.slice(12).join(" ")];
  }

  return ["(empty paste)", "No text content."];
}
