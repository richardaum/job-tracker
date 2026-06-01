export const EMPTY_TIPTAP_DOC = JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });

export type TipTapMark = { type: string; attrs?: Record<string, unknown> };

export type TipTapNode = {
  type?: string;
  text?: string;
  marks?: TipTapMark[];
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
};

export type TipTapDocument = { type: "doc"; content: TipTapNode[] };

export type StructuredNoteSection = { heading: string; bullets: string[] };
export type StructuredNoteOutput = { sections: StructuredNoteSection[] };
