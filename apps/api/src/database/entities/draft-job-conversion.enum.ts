/** Stored on drafts as conversion_* columns pre-merge; surfaced on jobs as fill_* (Async metadata) post-merge. */
export enum DraftJobConversionStatusEnum {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
}
