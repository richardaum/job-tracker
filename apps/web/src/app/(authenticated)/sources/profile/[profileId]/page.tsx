"use client";

import { cn } from "@job-tracker/ui";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

import { useSourceProfilesListQuery } from "@/gql/hooks";
import { SourceSideDetailsPage } from "@/modules/sources/page/SourceSideDetailsPage";

export default function SourceProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = React.use(params);
  const router = useRouter();
  const { data } = useSourceProfilesListQuery();

  const sourceProfile = useMemo(() => {
    return (
      data?.sourceProfiles.find((p) => p.sourceProfileId === profileId) ?? null
    );
  }, [data, profileId]);

  return (
    <div className={cn("flex h-full min-h-0 min-w-0 flex-col overflow-hidden")}>
      <SourceSideDetailsPage
        sourceProfile={sourceProfile}
        onOpenChange={(open) => {
          if (!open) router.push("/sources");
        }}
      />
    </div>
  );
}
