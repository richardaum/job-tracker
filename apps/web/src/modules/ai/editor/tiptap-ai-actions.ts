export type TipTapAiActionKind = "generate" | "rewrite";

export interface TipTapAiActionContext {
  sourceText: string;
  documentText: string;
}

export interface TipTapAiAction {
  id: string;
  label: string;
  kind: TipTapAiActionKind;
  requiresSourceText?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  run: (context: TipTapAiActionContext) => Promise<string | null | undefined>;
  onError?: () => void;
}
