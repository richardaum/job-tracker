"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Button,
  DropdownMenu,
  DropdownMenuItem,
  Heading,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Toast,
  cn,
} from "@job-tracker/ui";
import {
  ApplicationStage,
  useApplicationQuery,
  useApplicationStageEventsQuery,
} from "@/gql/hooks";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { type ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";
import { StatusBadge } from "@/modules/applications/shared/components/StatusBadge";
import { OverviewTabContent } from "@/modules/applications/details/components/OverviewTabContent";
import { DescriptionTabContent } from "@/modules/applications/details/components/DescriptionTabContent";
import { NotesPanelTabsContent } from "@/modules/applications/details/components/NotesPanel";
import { HistoryPanelTabsContent } from "@/modules/applications/details/components/HistoryPanel";
import { ActivitySidePanel } from "@/modules/applications/details/components/ActivitySidePanel";
import { UpdateStatusAction } from "@/modules/applications/details/components/UpdateStatusAction";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicationDetailsPage({ params }: PageProps) {
  const { id } = React.use(params);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastIntent, setToastIntent] = useState<"success" | "error">(
    "success",
  );

  const { data, loading, error } = useApplicationQuery({
    variables: { id },
    fetchPolicy: "cache-and-network",
  });
  const { data: stageEventsData } = useApplicationStageEventsQuery({
    variables: { applicationId: id },
    fetchPolicy: "cache-and-network",
  });

  const application = data?.application as ApplicationDetailsValues | undefined;
  const currentStage =
    stageEventsData?.applicationStageEvents[0]?.toStage ?? ApplicationStage.New;
  const isDesktop = useBreakpoint("(min-width: 1024px)");

  function showToast(message: string, intent: "success" | "error") {
    setToastMessage(message);
    setToastIntent(intent);
    setToastOpen(true);
  }

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
  }: {
    currentApplication: ApplicationDetailsValues;
    overviewClassName: string;
    descriptionClassName: string;
  }) {
    return (
      <>
        <TabsContent value="overview" className={cn(overviewClassName)}>
          <OverviewTabContent
            application={currentApplication}
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
      <DropdownMenuItem onSelect={() => setActionsOpen(true)}>
        Update status
      </DropdownMenuItem>
    </DropdownMenu>
  ) : null;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-2 border-b border-border-subtle px-4 py-4 sm:px-6 sm:py-5",
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
              className={cn("align-middle whitespace-nowrap")}
            />
          </Heading>
        </div>
        {application ? (
          <UpdateStatusAction
            applicationId={application.id}
            currentStage={currentStage}
            open={actionsOpen}
            onOpenChange={setActionsOpen}
            onSuccess={handleEntitySuccess}
            onError={handleEntityError}
          />
        ) : null}
      </div>

      <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>
        {loading && !data ? (
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
            className={cn("flex h-full min-h-0 w-full flex-col")}
          >
            <TabsList className={cn("w-full shrink-0 flex-wrap")}>
              {renderPrimaryTabTriggers()}
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {renderPrimaryTabContents({
              currentApplication: application,
              overviewClassName: "mt-3 flex-1 min-h-0 overflow-auto px-2",
              descriptionClassName: "mt-3 flex-1 min-h-0 overflow-auto",
            })}

            <NotesPanelTabsContent
              applicationId={application.id}
              className="mt-3"
            />
            <HistoryPanelTabsContent
              applicationId={application.id}
              className="mt-3"
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
              className={cn("flex h-full min-h-0 w-full flex-col")}
            >
              <TabsList>{renderPrimaryTabTriggers()}</TabsList>

              {renderPrimaryTabContents({
                currentApplication: application,
                overviewClassName: "mt-3 flex-1 min-h-0 overflow-auto px-2",
                descriptionClassName: "mt-3 flex-1 min-h-0 overflow-auto",
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

      <Toast
        trigger={<span aria-hidden style={{ display: "none" }} />}
        open={toastOpen}
        onOpenChange={setToastOpen}
        title={toastMessage}
        intent={toastIntent}
      />
    </div>
  );
}
