"use client";

import { Badge, Card, cn, Text } from "@job-tracker/ui";
import { ClipboardTextIcon } from "@phosphor-icons/react";

import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";

import { splitPreviewLines } from "./splitPreviewLines";
import { usePasteCapture } from "./usePasteCapture";

export default function AiApplicationCreatePageV2() {
  const { enqueueToast } = useToastQueue();
  const { isPageFocused, pastes } = usePasteCapture({
    enabled: true,
    onDuplicatePaste: () => {
      enqueueToast({
        title: "This paste already exists in the list.",
        intent: "info",
      });
    },
  });

  let headerLabel = "No pastes yet";
  if (pastes.length === 1) headerLabel = "1 paste captured";
  if (pastes.length > 1) headerLabel = `${pastes.length} pastes captured`;

  return (
    <div
      data-testid="ai-application-create-page-v2"
      className={cn("h-full overflow-auto p-4 sm:p-6")}
    >
      <div className={cn("mx-auto max-w-3xl space-y-4")}>
        <div className={cn("space-y-1")}>
          <Text size="lg" weight="semibold">
            New application with AI
          </Text>
          <Text size="sm" color="secondary">
            Paste content to build the capture list.
          </Text>
        </div>

        <div className={cn("space-y-2")}>
          <Text size="xs" color={isPageFocused ? "secondary" : "muted"}>
            {isPageFocused ? "Page is focused." : "Page is not focused."}{" "}
            {headerLabel}.
          </Text>

          {pastes.map((item) => {
            const [lineOne, lineTwo] = splitPreviewLines(item.text);

            return (
              <Card
                key={item.id}
                variant="outlined"
                padding="sm"
                className={cn("flex items-start gap-3")}
              >
                <div
                  className={cn(
                    "mt-0.5 rounded-md border border-border-subtle p-1.5 text-text-secondary",
                  )}
                >
                  <ClipboardTextIcon size={16} aria-hidden />
                </div>

                <div className={cn("min-w-0 flex-1")}>
                  <div className={cn("mb-1 flex items-start gap-2")}>
                    <Text
                      size="sm"
                      weight="medium"
                      className={cn(
                        "min-w-0 flex-1 line-clamp-1 wrap-break-word",
                      )}
                    >
                      {lineOne}
                    </Text>
                    <Badge intent="default" className={cn("shrink-0")}>
                      {item.html ? "HTML" : "Plain text"}
                    </Badge>
                  </div>
                  <Text
                    size="xs"
                    color="secondary"
                    className={cn("line-clamp-2 wrap-break-word")}
                  >
                    {lineTwo}
                  </Text>
                </div>
              </Card>
            );
          })}

          {pastes.length === 0 ? (
            <Card variant="outlined" padding="sm">
              <Text size="sm" color="muted">
                Start pasting content to populate this list.
              </Text>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
