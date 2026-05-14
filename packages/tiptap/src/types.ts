export const EMPTY_TIPTAP_DOC = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export type TipTapNode = {
  type?: string;
  text?: string;
  content?: TipTapNode[];
};

export type TipTapDocument = { type: "doc"; content: TipTapNode[] };

export type StructuredNoteSection = { heading: string; bullets: string[] };
export type StructuredNoteOutput = { sections: StructuredNoteSection[] };
