"use client";

export function mergeFinalWithInterimSegments(finalSegments: string[], interimSegments: string[]) {
  const interimTranscript = interimSegments.join(" ").trim();
  let mergedFinalTranscript = "";
  for (const rawSegment of finalSegments) {
    const segment = rawSegment.trim();
    if (!segment) continue;
    if (!mergedFinalTranscript) {
      mergedFinalTranscript = segment;
      continue;
    }
    if (mergedFinalTranscript.endsWith(segment)) {
      continue;
    }
    const maxOverlap = Math.min(mergedFinalTranscript.length, segment.length);
    let overlapLength = 0;
    for (let size = maxOverlap; size > 0; size -= 1) {
      const mergedSuffix = mergedFinalTranscript.slice(-size).toLowerCase();
      const segmentPrefix = segment.slice(0, size).toLowerCase();
      if (mergedSuffix === segmentPrefix) {
        overlapLength = size;
        break;
      }
    }
    mergedFinalTranscript = `${mergedFinalTranscript}${segment.slice(overlapLength)}`.trim();
  }
  return `${mergedFinalTranscript} ${interimTranscript}`.trim();
}
