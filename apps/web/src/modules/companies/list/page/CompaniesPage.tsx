"use client";

import { Card, cn, Skeleton, Stack, Text } from "@job-tracker/ui";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { SearchInput } from "@/modules/applications/shared/components/SearchInput";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import { normalizeTipTapDocument } from "@/modules/applications/shared/utils/tiptap";
import { CompanyCard } from "@/modules/companies/list/components/CompanyCard";
import { useCompaniesListViewModel } from "@/modules/companies/list/hooks/useCompaniesListViewModel";
import { CompanyEditDialog } from "@/modules/companies/shared/components/CompanyEditDialog";

interface EditingCompany {
  id: string;
  name: string;
  description: string | null;
}

function CompaniesListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} padding="sm">
          <div className={cn("space-y-3")}>
            <Skeleton variant="text" className={cn("h-5 w-44 max-w-full")} />
            <Skeleton variant="text" className={cn("h-4 w-full max-w-2xl")} />
            <Skeleton variant="text" className={cn("h-4 w-full max-w-lg")} />
          </div>
        </Card>
      ))}
    </Stack>
  );
}

export default function CompaniesPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [recentlyVisitedCompanyId, setRecentlyVisitedCompanyId] = useState<
    string | null
  >(null);
  const [editingCompany, setEditingCompany] = useState<EditingCompany | null>(
    null,
  );
  const { enqueueToast } = useToastQueue();

  const {
    companies,
    filteredCompanies,
    loading,
    error,
    showInitialLoading,
    scrollKey,
    recentlyVisitedCompanyStorageKey,
  } = useCompaniesListViewModel(query);

  useScrollRestoration({
    key: scrollKey,
    containerRef: scrollContainerRef,
    ready: !loading,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loading) return;

    const storedCompanyId = window.sessionStorage.getItem(
      recentlyVisitedCompanyStorageKey,
    );
    if (!storedCompanyId) return;

    const companyExistsInCurrentList = filteredCompanies.some(
      (company) => company.id === storedCompanyId,
    );
    if (!companyExistsInCurrentList) return;

    const highlightFrameId = window.requestAnimationFrame(() => {
      setRecentlyVisitedCompanyId(storedCompanyId);
    });
    window.sessionStorage.removeItem(recentlyVisitedCompanyStorageKey);
    return () => window.cancelAnimationFrame(highlightFrameId);
  }, [filteredCompanies, loading, recentlyVisitedCompanyStorageKey]);

  function handleOpenCompanyDetails(companyId: string) {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(recentlyVisitedCompanyStorageKey, companyId);
  }

  function openEditModal(company: EditingCompany) {
    setEditingCompany(company);
  }

  function closeEditModal() {
    setEditingCompany(null);
  }

  return (
    <div className={cn("flex h-full flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border-subtle p-4  sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search companies..."
          ariaLabel="Search companies"
        />

        <Text
          size="sm"
          color="muted"
          className={cn("w-full text-left sm:w-auto")}
        >
          {companies.length} companies
        </Text>
      </div>

      <div
        ref={scrollContainerRef}
        className={cn("flex min-h-0 flex-1 flex-col overflow-auto p-4 sm:p-6")}
      >
        {showInitialLoading ? (
          <CompaniesListSkeleton />
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load companies. Please refresh the page.
          </Text>
        ) : filteredCompanies.length === 0 ? (
          <EmptyState
            variant="filtered"
            hasActiveFilter={query.trim().length > 0}
            noMatchMessage="No companies match your search."
            emptyListMessage="No companies found yet."
            noMatchDetail="Try a different name or clear the search box."
            emptyListDetail="When you add companies, they will appear in this list."
          />
        ) : (
          <Stack gap="sm">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={{
                  id: company.id,
                  name: company.name,
                  description: company.description ?? null,
                }}
                onEdit={openEditModal}
                onOpenDetails={handleOpenCompanyDetails}
                isRecentlyVisited={recentlyVisitedCompanyId === company.id}
                onRecentlyVisitedAnimationEnd={() =>
                  setRecentlyVisitedCompanyId((currentId) =>
                    currentId === company.id ? null : currentId,
                  )
                }
                onViewJobs={(companyName) =>
                  router.push(
                    `/applications?company=${encodeURIComponent(companyName)}`,
                  )
                }
                onDeleteSuccess={(message) =>
                  enqueueToast({ title: message, intent: "success" })
                }
                onDeleteError={(message) =>
                  enqueueToast({ title: message, intent: "error" })
                }
              />
            ))}
          </Stack>
        )}
      </div>

      {editingCompany ? (
        <CompanyEditDialog
          open={Boolean(editingCompany)}
          onOpenChange={(open) => {
            if (!open) {
              closeEditModal();
            }
          }}
          company={{
            id: editingCompany.id,
            name: editingCompany.name,
            description: normalizeTipTapDocument(editingCompany.description),
          }}
          refetchCompanies={true}
          onSuccess={(message) => {
            enqueueToast({ title: message, intent: "success" });
            closeEditModal();
          }}
          onError={(message) => {
            enqueueToast({ title: message, intent: "error" });
          }}
        />
      ) : null}
    </div>
  );
}
