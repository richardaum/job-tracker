import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

import { useWelcomeTour } from "./useWelcomeTour";

export function useWelcomeTourCreatedJobToast() {
  const { dismissToast } = useToastQueue();
  const { takeCreatedJobToastId } = useWelcomeTour();

  function closeCreatedJobToast() {
    const toastId = takeCreatedJobToastId();
    if (toastId) dismissToast(toastId);
  }

  return { closeCreatedJobToast };
}
