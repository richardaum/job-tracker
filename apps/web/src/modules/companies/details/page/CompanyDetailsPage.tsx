"use client";

import {
  EMPTY_TIPTAP_DOC,
  normalizeTipTapDocument,
  tipTapToPlainText,
} from "@job-tracker/tiptap";
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
import { BriefcaseIcon, CaretDownIcon, TrashIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import React from "react";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header";
import { EntityNotFound } from "@/components/entity-not-found";
import { CompaniesDocument, useUpdateCompanyMutation } from "@/gql/hooks";
import { useGenerateCompanyDescriptionAiAction } from "@/modules/ai/actions/useGenerateCompanyDescriptionAiAction";
import { useRewriteTextAiAction } from "@/modules/ai/actions/useRewriteTextAiAction";
import { useCompanyDetailsViewModel } from "@/modules/companies/details/hooks/useCompanyDetailsViewModel";
import { DeleteCompanyDialog } from "@/modules/companies/list/components/DeleteCompanyDialog";
import { TipTapEditor } from "@/modules/jobs/details/components/TipTapEditor";
import { JobCard } from "@/modules/jobs/list/components/JobCard";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CompanyDetailsPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const { enqueueToast } = useToastQueue();
  const [actionsMenuOpen, setActionsMenuOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const {
    company,
    companyJobs,
    applicationsError,
    companiesError,
    status,
    showApplicationsInitialLoading,
    notFound,
  } = useCompanyDetailsViewModel(id);
  const [descriptionDraftState, setDescriptionDraftState] = React.useState<{
    companyId: string | null;
    value: string;
  }>({ companyId: null, value: EMPTY_TIPTAP_DOC });
  const [updateCompany, { loading: savingDescription }] =
    useUpdateCompanyMutation({
      refetchQueries: [{ query: CompaniesDocument }],
    });
  const generateCompanyDescriptionAction =
    useGenerateCompanyDescriptionAiAction({
      companyName: company?.name ?? "",
      disabled: savingDescription,
    });
  const rewriteCompanyDescriptionAction = useRewriteTextAiAction({
    disabled: savingDescription,
  });
  const companyDescriptionAiActions = React.useMemo(
    () => [generateCompanyDescriptionAction, rewriteCompanyDescriptionAction],
    [generateCompanyDescriptionAction, rewriteCompanyDescriptionAction],
  );

  const currentDescription = normalizeTipTapDocument(company?.description);
  const descriptionDraft =
    descriptionDraftState.companyId === company?.id
      ? descriptionDraftState.value
      : currentDescription;
  const descriptionChanged = descriptionDraft !== currentDescription;
  async function handleSaveDescription() {
    if (!company || !descriptionChanged) {
      return;
    }
    const nextDescription =
      tipTapToPlainText(descriptionDraft).trim().length > 0
        ? descriptionDraft
        : null;

    await updateCompany({
      variables: { id: company.id, input: { description: nextDescription } },
    });
  }

  function renderTabTriggers() {
    return (
      <>
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
        <TabsTrigger value="description">Description</TabsTrigger>
      </>
    );
  }

  const actionsMenu = company ? (
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
        >
          Actions
        </Button>
      }
      align="end"
    >
      <DropdownMenuItem
        onSelect={() =>
          router.push(`/jobs?company=${encodeURIComponent(company.name)}`)
        }
        icon={<BriefcaseIcon size={14} weight="regular" />}
      >
        View jobs
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        destructive
        onSelect={() => setDeleteDialogOpen(true)}
        icon={<TrashIcon size={14} weight="regular" />}
      >
        Remove company
      </DropdownMenuItem>
    </DropdownMenu>
  ) : null;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <DetailPageHeader trailing={actionsMenu ?? undefined}>
        <BackToLink href="/companies">Back to companies</BackToLink>
        <Heading as="h1" size="2xl" className={cn("min-w-0")}>
          {company?.name ?? "Company details"}
        </Heading>
        {company ? (
          <DeleteCompanyDialog
            trigger={<span aria-hidden style={{ display: "none" }} />}
            companyId={company.id}
            companyName={company.name}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={() => router.push("/companies")}
            onError={(message) =>
              enqueueToast({ title: message, intent: "error" })
            }
          />
        ) : null}
      </DetailPageHeader>

      <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>
        {status === "loading" ? (
          <Text size="sm" color="secondary">
            Loading company...
          </Text>
        ) : notFound ? (
          <EntityNotFound
            resource="company"
            backHref="/companies"
            backLabel="Back to companies"
          />
        ) : companiesError && !notFound ? (
          <Text size="sm" color="error">
            Failed to load company details.
          </Text>
        ) : !company ? null : (
          <Tabs
            defaultValue="jobs"
            className={cn("flex size-full min-h-0  flex-col")}
          >
            <TabsList className={cn("w-full shrink-0 flex-wrap")}>
              {renderTabTriggers()}
            </TabsList>

            <TabsContent value="jobs" className={cn("mt-3 overflow-auto")}>
              {showApplicationsInitialLoading ? (
                <Text size="sm" color="secondary">
                  Loading jobs...
                </Text>
              ) : applicationsError ? (
                <Text size="sm" color="error">
                  Failed to load jobs.
                </Text>
              ) : companyJobs.length === 0 ? (
                <Text size="sm" color="muted">
                  No jobs found for this company.
                </Text>
              ) : (
                <div className={cn("space-y-3")}>
                  {companyJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSuccess={() => undefined}
                      onError={() => undefined}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="description"
              className={cn("mt-3 flex-1 min-h-0 overflow-hidden")}
            >
              <div className={cn("flex h-full min-h-0 flex-col gap-3")}>
                <div className={cn("flex-1 min-h-0")}>
                  <TipTapEditor
                    id="company-details-description"
                    value={descriptionDraft}
                    onChange={(nextValue) =>
                      setDescriptionDraftState({
                        companyId: company?.id ?? null,
                        value: nextValue || EMPTY_TIPTAP_DOC,
                      })
                    }
                    onHardEnter={() => void handleSaveDescription()}
                    placeholder="Add context about this company..."
                    disabled={savingDescription}
                    fillHeight
                    aiActions={companyDescriptionAiActions}
                  />
                </div>
                <div className={cn("flex justify-end")}>
                  <Button
                    intent="primary"
                    size="md"
                    onClick={() => void handleSaveDescription()}
                    disabled={!descriptionChanged || savingDescription}
                    state={savingDescription ? "loading" : "default"}
                  >
                    Save description
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
