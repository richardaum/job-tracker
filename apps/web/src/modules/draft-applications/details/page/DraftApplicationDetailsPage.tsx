"use client";

import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuItem,
  FieldWithLabelAction,
  Heading,
  OverviewSection,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@job-tracker/ui";
import { CaretDownIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import { useDraftApplicationDetailsViewModel } from "@/modules/draft-applications/details/hooks/useDraftApplicationDetailsViewModel";
import { DeleteDraftApplicationDialog } from "@/modules/draft-applications/list/components/DeleteDraftApplicationDialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

function draftPrimaryTitle(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname === "/" ? "" : u.pathname;
    const combined = `${host}${path}`;
    return combined.length > 120 ? `${combined.slice(0, 117)}…` : combined;
  } catch {
    return url.length > 120 ? `${url.slice(0, 117)}…` : url;
  }
}

function draftHeadingTitle(title: string, url: string): string {
  const trimmedTitle = title.trim();
  if (trimmedTitle.length > 0) {
    return trimmedTitle;
  }

  return draftPrimaryTitle(url);
}

export default function DraftApplicationDetailsPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { enqueueToast } = useToastQueue();

  const { draft, error, showInitialLoading } =
    useDraftApplicationDetailsViewModel(id);

  function showToast(message: string, intent: "success" | "error") {
    enqueueToast({ title: message, intent });
  }

  const actionsMenu = draft ? (
    <DropdownMenu
      open={actionsMenuOpen}
      onOpenChange={setActionsMenuOpen}
      trigger={
        <Button
          intent="secondary"
          size="sm"
          rightIcon={
            <CaretDownIcon
              size={12}
              weight="bold"
              className={cn(
                "transition-transform duration-200",
                actionsMenuOpen ? "rotate-180" : "rotate-0",
              )}
            />
          }
          className={cn("h-8 px-2.5 text-xs")}
        >
          Actions
        </Button>
      }
      align="end"
    >
      <DropdownMenuItem destructive onSelect={() => setDeleteDialogOpen(true)}>
        Remove
      </DropdownMenuItem>
    </DropdownMenu>
  ) : null;

  function renderOverviewBody() {
    if (!draft) return null;
    return (
      <OverviewSection layout="grid">
        <FieldWithLabelAction
          label="Page title"
          content={
            <Text size="sm" className={cn("break-words")}>
              {draft.title.trim() || "Untitled page"}
            </Text>
          }
        />
        <FieldWithLabelAction
          label="Source URL"
          content={
            <a
              href={draft.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "block break-all text-sm text-text-brand underline-offset-2 hover:underline",
              )}
            >
              {draft.url}
            </a>
          }
        />
        <FieldWithLabelAction
          label="Draft id"
          content={
            <Text size="sm" className={cn("break-all font-mono")}>
              {draft.id}
            </Text>
          }
        />
      </OverviewSection>
    );
  }

  function renderCapturedBody() {
    if (!draft) return null;
    return (
      <div
        className={cn(
          "flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-border-subtle bg-bg-surface",
        )}
      >
        <iframe
          title="Captured posting HTML"
          srcDoc={draft.htmlContent}
          sandbox=""
          className={cn("h-full min-h-0 flex-1 border-0")}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-2 border-b border-border-subtle px-4 py-4 sm:px-6 sm:py-5",
        )}
      >
        <div className={cn("flex items-center justify-between gap-3")}>
          <Link
            href="/draft-applications"
            className={cn(
              "text-sm text-text-secondary underline-offset-2 hover:underline",
            )}
          >
            Back to drafts
          </Link>
          <div
            className={cn(
              "flex shrink-0 flex-wrap items-center justify-end gap-2",
            )}
          >
            {draft ? <>{actionsMenu}</> : null}
          </div>
        </div>
        <div className={cn("flex items-start gap-3")}>
          <Heading as="h1" size="2xl" className={cn("min-w-0 flex-1")}>
            <span>
              {draft
                ? draftHeadingTitle(draft.title, draft.url)
                : "Draft application"}
            </span>{" "}
            <span
              className={cn(
                "ml-2 inline-flex align-middle whitespace-nowrap rounded-full border border-border-subtle bg-bg-surface-hover px-2.5 py-0.5 text-xs font-medium text-text-secondary",
              )}
            >
              Draft
            </span>
          </Heading>
        </div>
        {draft ? (
          <DeleteDraftApplicationDialog
            trigger={<span aria-hidden style={{ display: "none" }} />}
            draftId={draft.id}
            draftSummary={draftHeadingTitle(draft.title, draft.url)}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={(msg) => {
              showToast(msg, "success");
              router.push("/draft-applications");
            }}
            onError={(msg) => showToast(msg, "error")}
          />
        ) : null}
      </div>

      <div className={cn("min-h-0 flex-1 overflow-hidden p-4 sm:p-6")}>
        {showInitialLoading ? (
          <Text size="sm" color="secondary">
            Loading draft...
          </Text>
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load draft application.
          </Text>
        ) : !draft ? (
          <Text size="sm" color="secondary">
            Draft not found.
          </Text>
        ) : (
          <Tabs
            defaultValue="overview"
            className={cn("flex h-full min-h-0 w-full flex-col")}
          >
            <TabsList className={cn("w-full shrink-0 flex-wrap")}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="captured">Captured</TabsTrigger>
            </TabsList>

            <TabsContent
              value="overview"
              className={cn("mt-3 flex-1 min-h-0 overflow-auto px-2")}
            >
              {renderOverviewBody()}
            </TabsContent>

            <TabsContent
              value="captured"
              className={cn("mt-3 flex-1 min-h-0 overflow-hidden")}
            >
              {renderCapturedBody()}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
