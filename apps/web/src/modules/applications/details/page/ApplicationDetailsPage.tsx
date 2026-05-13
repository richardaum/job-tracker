"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Heading,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@job-tracker/ui";
import { CaretDownIcon, SparkleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { useGenerateApplicationFitMutation } from "@/gql/hooks";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { ActivitySidePanel } from "@/modules/applications/details/components/ActivitySidePanel";
import { DescriptionTabContent } from "@/modules/applications/details/components/DescriptionTabContent";
import { FitWizardDialog } from "@/modules/applications/details/components/FitWizardDialog";
import { HistoryPanelTabsContent } from "@/modules/applications/details/components/HistoryPanel";
import { NotesPanelTabsContent } from "@/modules/applications/details/components/NotesPanel";
import { OverviewTabContent } from "@/modules/applications/details/components/OverviewTabContent";
import { UpdateStatusAction } from "@/modules/applications/details/components/UpdateStatusAction";
import { useApplicationDetailsViewModel } from "@/modules/applications/details/hooks/useApplicationDetailsViewModel";
import { type ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";
import { DeleteApplicationDialog } from "@/modules/applications/list/components/DeleteApplicationDialog";
import { StatusBadge } from "@/modules/applications/shared/components/StatusBadge";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicationDetailsPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fitWizardOpen, setFitWizardOpen] = useState(false);
  const [generateApplicationFit, { loading: generatingFit }] =
    useGenerateApplicationFitMutation();
  const { enqueueToast } = useToastQueue();

  const {
    application,
    currentStage,
    currentStageReason,
    error,
    showInitialLoading,
    sourcePrimaryText,
  } = useApplicationDetailsViewModel(id);
  const isDesktop = useBreakpoint("(min-width: 1024px)");

  function showToast(message: string, intent: "success" | "error") {
    enqueueToast({ title: message, intent });
  }

  const handleGenerateFit = React.useCallback(
    async (resumeId: string) => {
      if (!application) return;
      const [error, result] = await tryRun(
        generateApplicationFit({
          variables: { input: { applicationId: application.id, resumeId } },
        }),
      );
      if (error) {
        enqueueToast({
          title:
            error instanceof Error
              ? error.message.replace("Bad Request Exception: ", "")
              : "Failed to generate fit analysis.",
          intent: "error",
        });
        return;
      }
      enqueueToast({
        title: "Fit analysis generation started.",
        intent: "success",
      });
      if (result?.data?.generateApplicationFit?.id) {
        router.push(`/fit/${result.data.generateApplicationFit.id}`);
      }
    },
    [application, generateApplicationFit, enqueueToast, router],
  );

  const handleEntitySuccess = (message: string) =>
    showToast(message, "success");
  const handleEntityError = (message: string) => showToast(message, "error");
  const handleDescriptionSuccess = () =>
    showToast("Description saved.", "success");
  const handleDescriptionError = () =>
    showToast("Failed to save description.", "error");

  function renderPrimaryTabTriggers() {
    return (
      <>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="description">Description</TabsTrigger>
      </>
    );
  }

  function renderPrimaryTabContents({
    currentApplication,
    overviewClassName,
    descriptionClassName,
    overviewSourcePrimaryText,
  }: {
    currentApplication: ApplicationDetailsValues;
    overviewClassName: string;
    descriptionClassName: string;
    overviewSourcePrimaryText: string | null;
  }) {
    return (
      <>
        <TabsContent value="overview" className={cn(overviewClassName)}>
          <OverviewTabContent
            application={currentApplication}
            sourcePrimaryText={overviewSourcePrimaryText}
            onSuccess={handleEntitySuccess}
            onError={handleEntityError}
          />
        </TabsContent>

        <TabsContent value="description" className={cn(descriptionClassName)}>
          <DescriptionTabContent
            application={currentApplication}
            onSuccess={handleDescriptionSuccess}
            onError={handleDescriptionError}
          />
        </TabsContent>
      </>
    );
  }

  const actionsMenu = application ? (
    <DropdownMenu
      open={actionsMenuOpen}
      onOpenChange={setActionsMenuOpen}
      trigger={
        <Button
          intent="secondary"
          size="md"
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
      <DropdownMenuItem onSelect={() => setActionsOpen(true)}>
        Update status
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => {
          if (application?.fit?.id) {
            router.push(`/fit/${application.fit.id}`);
          } else {
            setFitWizardOpen(true);
          }
        }}
        icon={<SparkleIcon size={14} weight="regular" />}
      >
        Fit analysis
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem destructive onSelect={() => setDeleteDialogOpen(true)}>
        Remove
      </DropdownMenuItem>
    </DropdownMenu>
  ) : null;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-2 border-b border-border-subtle p-4  sm:px-6 sm:py-5",
        )}
      >
        <div className={cn("flex items-center justify-between gap-3")}>
          <Link
            href="/applications"
            className={cn(
              "text-sm text-text-secondary underline-offset-2 hover:underline",
            )}
          >
            Back to applications
          </Link>
          {actionsMenu ? (
            <div className={cn("shrink-0")}>{actionsMenu}</div>
          ) : null}
        </div>
        <div className={cn("flex items-start gap-3")}>
          <Heading as="h1" size="2xl" className={cn("min-w-0 flex-1")}>
            <span>{application?.title ?? "Application details"}</span>{" "}
            <StatusBadge
              stage={currentStage}
              reason={currentStageReason}
              className={cn("align-middle whitespace-nowrap")}
            />
          </Heading>
        </div>
        {application ? (
          <>
            <UpdateStatusAction
              applicationId={application.id}
              currentStage={currentStage}
              open={actionsOpen}
              onOpenChange={setActionsOpen}
              onSuccess={handleEntitySuccess}
              onError={handleEntityError}
            />
            <DeleteApplicationDialog
              trigger={<span aria-hidden style={{ display: "none" }} />}
              applicationId={application.id}
              applicationTitle={application.title}
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onSuccess={() => router.push("/applications")}
              onError={(msg) => handleEntityError(msg)}
            />
          </>
        ) : null}
      </div>

      <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>
        {showInitialLoading ? (
          <Text size="sm" color="secondary">
            Loading application...
          </Text>
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load application details.
          </Text>
        ) : !application ? (
          <Text size="sm" color="secondary">
            Application not found.
          </Text>
        ) : !isDesktop ? (
          <Tabs
            defaultValue="overview"
            className={cn("flex size-full min-h-0  flex-col")}
          >
            <TabsList className={cn("w-full shrink-0 flex-wrap")}>
              {renderPrimaryTabTriggers()}
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {renderPrimaryTabContents({
              currentApplication: application,
              overviewClassName: cn("mt-3 flex-1 min-h-0 overflow-auto px-2"),
              descriptionClassName: cn("mt-3 flex-1 min-h-0 overflow-auto"),
              overviewSourcePrimaryText: sourcePrimaryText,
            })}

            <NotesPanelTabsContent
              applicationId={application.id}
              className={cn("mt-3")}
            />
            <HistoryPanelTabsContent
              applicationId={application.id}
              className={cn("mt-3")}
              onSuccess={handleEntitySuccess}
              onError={handleEntityError}
            />
          </Tabs>
        ) : (
          <div
            className={cn(
              "grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]",
            )}
          >
            <Tabs
              defaultValue="overview"
              className={cn("flex size-full min-h-0  flex-col")}
            >
              <TabsList>{renderPrimaryTabTriggers()}</TabsList>

              {renderPrimaryTabContents({
                currentApplication: application,
                overviewClassName: cn("mt-3 flex-1 min-h-0 overflow-auto px-2"),
                descriptionClassName: cn("mt-3 flex-1 min-h-0 overflow-auto"),
                overviewSourcePrimaryText: sourcePrimaryText,
              })}
            </Tabs>

            <div
              className={cn(
                "min-h-0 overflow-hidden border-l border-border-subtle pl-4",
              )}
            >
              <ActivitySidePanel
                applicationId={application.id}
                onSuccess={handleEntitySuccess}
                onError={handleEntityError}
              />
            </div>
          </div>
        )}
      </div>
      <FitWizardDialog
        open={fitWizardOpen}
        onOpenChange={setFitWizardOpen}
        onGenerate={handleGenerateFit}
        generating={generatingFit}
        hasExistingFit={!!application?.fit}
      />
    </div>
  );
}
