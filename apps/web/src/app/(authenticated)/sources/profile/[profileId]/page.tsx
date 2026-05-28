"use client";

import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

import { useSourceProfilesListQuery } from "@/gql/hooks";
import { SourceSideDetailsPage } from "@/modules/sources/page/SourceSideDetailsPage";
import { SourcesLayout } from "@/modules/sources/page/SourcesLayout";

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
    <SourcesLayout>
      <SourceSideDetailsPage
        sourceProfile={sourceProfile}
        onOpenChange={(open) => {
          if (!open) router.push("/sources");
        }}
      />
    </SourcesLayout>
  );
}
