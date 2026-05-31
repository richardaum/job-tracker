export type BoardType = "Sequential" | "NonSequential";

export type SurfaceField = {
  key: string;
  selector?: string;
  type: "attribute" | "property" | "regex";
  value: string;
  sourceField?: string;
};

export type DetailsField = {
  key: string;
  selector: string;
  type: "attribute" | "property";
  value: string;
  format?: "tiptap" | "salary";
};

export type Pagination = {
  containerSelector: string;
  nextButtonPartialMatch: string;
};

export type CollectJobsInput = {
  containerSelector: string;
  itemSelector: string;
  detailsUrlField: string;
  key?: string;
  direction: "up" | "down";
  parallelDetailsTabs: number;
  pagination?: Pagination;
  surfaceFields: SurfaceField[];
  detailsFields: DetailsField[];
};

export type ParseRegexField = {
  key: string;
  pattern: string;
  flags?: string;
  group?: number;
  required?: boolean;
};

export type ParseRegexInput = { text: string; fields: ParseRegexField[] };

export type Step = {
  id: string;
  action:
    | { kind: "collect.jobs"; input: CollectJobsInput }
    | { kind: "parse.regex"; input: ParseRegexInput };
};
