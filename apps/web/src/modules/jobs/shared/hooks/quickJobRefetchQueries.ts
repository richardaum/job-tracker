import { JobsDocument, QuickFilterCountsDocument } from "@/gql/hooks";

export const quickJobRefetchQueries = [{ query: JobsDocument }, { query: QuickFilterCountsDocument }];
