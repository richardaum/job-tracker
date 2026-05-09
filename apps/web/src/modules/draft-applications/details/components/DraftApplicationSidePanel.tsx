"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@job-tracker/ui";
import { ArrowSquareOutIcon, CopyIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";

export function DraftOriginalSection({ sourceUrl }: { sourceUrl: string }) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyUrl = useCallback(async () => {
    const [error] = await tryRun(navigator.clipboard.writeText(sourceUrl));
    if (error) {
      setCopiedUrl(false);
      return;
    }
    setCopiedUrl(true);
    window.setTimeout(() => setCopiedUrl(false), 2000);
  }, [sourceUrl]);

  return (
    <Stack gap="sm">
      <Text size="sm" color="secondary">
        Open the posting in your browser.
      </Text>
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-bg-brand px-5 py-2 text-sm font-medium text-text-inverted shadow-sm transition-colors hover:bg-bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset",
        )}
      >
        <ArrowSquareOutIcon size={16} weight="bold" />
        Open original URL
      </a>
      <Button
        intent="secondary"
        size="md"
        type="button"
        onClick={() => void copyUrl()}
        leftIcon={<CopyIcon size={16} weight="bold" />}
      >
        {copiedUrl ? "Copied link" : "Copy URL"}
      </Button>
    </Stack>
  );
}

export function DraftMetaSection({ draftId }: { draftId: string }) {
  const [copiedId, setCopiedId] = useState(false);

  const copyId = useCallback(async () => {
    const [error] = await tryRun(navigator.clipboard.writeText(draftId));
    if (error) {
      setCopiedId(false);
      return;
    }
    setCopiedId(true);
    window.setTimeout(() => setCopiedId(false), 2000);
  }, [draftId]);

  return (
    <Stack gap="sm">
      <div>
        <Text
          size="xs"
          weight="semibold"
          color="muted"
          className={cn("uppercase tracking-wide")}
        >
          Draft id
        </Text>
        <Text size="sm" className={cn("mt-1 break-all font-mono")}>
          {draftId}
        </Text>
      </div>
      <Button
        intent="secondary"
        size="md"
        type="button"
        onClick={() => void copyId()}
        leftIcon={<CopyIcon size={16} weight="bold" />}
      >
        {copiedId ? "Copied id" : "Copy draft id"}
      </Button>
    </Stack>
  );
}

export function DraftApplicationSidePanel({
  draftId,
  sourceUrl,
}: {
  draftId: string;
  sourceUrl: string;
}) {
  return (
    <Tabs
      defaultValue="original"
      className={cn("flex size-full min-h-0  flex-col")}
    >
      <TabsList className={cn("w-full shrink-0")}>
        <TabsTrigger value="original" className={cn("flex-1")}>
          Original
        </TabsTrigger>
        <TabsTrigger value="meta" className={cn("flex-1")}>
          Details
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="original"
        className={cn("mt-3 flex-1 min-h-0 overflow-auto")}
      >
        <DraftOriginalSection sourceUrl={sourceUrl} />
      </TabsContent>

      <TabsContent
        value="meta"
        className={cn("mt-3 flex-1 min-h-0 overflow-auto")}
      >
        <DraftMetaSection draftId={draftId} />
      </TabsContent>
    </Tabs>
  );
}
