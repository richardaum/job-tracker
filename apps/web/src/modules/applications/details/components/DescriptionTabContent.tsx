import { cn } from "@job-tracker/ui";
import React from "react";

import type { ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";

import { DescriptionEditor } from "./DescriptionEditor";

export function DescriptionTabContent({
  application,
  onSuccess,
  onError,
}: {
  application: ApplicationDetailsValues;
  onSuccess: () => void;
  onError: () => void;
}) {
  return (
    <div className={cn("h-full min-h-0")}>
      <DescriptionEditor
        key={application.id}
        applicationId={application.id}
        initialDescription={application.description}
        onSuccess={onSuccess}
        onError={onError}
      />
    </div>
  );
}
