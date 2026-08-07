import { cn } from "@job-tracker/ui";
import { tipTapToPlainText } from "@job-tracker/tiptap";

import { useUpdateJobMutation } from "@/gql/hooks";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";

import { DescriptionEditor } from "./DescriptionEditor";

type DescriptionTabContentProps = { job: JobDetailsValues; onError: () => void };

export function DescriptionTabContent({ job, onError }: DescriptionTabContentProps) {
  const [updateJob] = useUpdateJobMutation();

  async function saveDescription(nextDescription: string) {
    const description = tipTapToPlainText(nextDescription).trim().length > 0 ? nextDescription : null;
    await updateJob({ variables: { id: job.id, input: { description } } });
  }

  return (
    <div className={cn("h-full min-h-0")}>
      <DescriptionEditor key={job.id} initialDescription={job.description} onSave={saveDescription} onError={onError} />
    </div>
  );
}
