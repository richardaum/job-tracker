"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Card, Input, Skeleton, Stack, Text, Toast, cn } from "@job-tracker/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCompaniesQuery } from "@/gql/hooks";
import { normalizeTipTapDocument } from "@/modules/applications/shared/utils/tiptap";
import { CompanyCard } from "@/modules/companies/list/components/CompanyCard";
import { CompanyEditDialog } from "@/modules/companies/shared/components/CompanyEditDialog";

interface ToastState {
  open: boolean;
  message: string;
  intent: "success" | "error";
}

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
  const [query, setQuery] = useState("");
  const [editingCompany, setEditingCompany] = useState<EditingCompany | null>(
    null,
  );
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    intent: "success",
  });

  const { data, loading, error } = useCompaniesQuery({
    fetchPolicy: "cache-and-network",
  });
  const companies = useMemo(() => data?.companies ?? [], [data]);
  const filteredCompanies = useMemo(() => {
    const normalizedSearch = query.trim().toLowerCase();
    if (!normalizedSearch) return companies;
    return companies.filter((company) =>
      company.name.toLowerCase().includes(normalizedSearch),
    );
  }, [companies, query]);

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
          "flex flex-col gap-3 border-b border-border-subtle px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-2 rounded-md border border-border-subtle bg-bg-surface-hover px-3 py-2 sm:max-w-sm",
          )}
        >
          <MagnifyingGlassIcon
            size={14}
            weight="regular"
            className={cn("shrink-0 text-text-muted")}
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search companies..."
            aria-label="Search companies"
            className={cn("border-none bg-transparent px-0 py-0 shadow-none")}
          />
        </div>

        <Text
          size="sm"
          color="muted"
          className={cn("w-full text-left sm:w-auto")}
        >
          {companies.length} companies
        </Text>
      </div>

      <div className={cn("flex-1 overflow-auto p-4 sm:p-6")}>
        {loading && !data ? (
          <CompaniesListSkeleton />
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load companies. Please refresh the page.
          </Text>
        ) : filteredCompanies.length === 0 ? (
          <Card variant="outlined">
            <Stack align="center" justify="center" gap="sm">
              <Text size="sm" color="secondary">
                {query.trim()
                  ? "No companies match your search."
                  : "No companies found yet."}
              </Text>
            </Stack>
          </Card>
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
                onViewJobs={(companyName) =>
                  router.push(
                    `/applications?company=${encodeURIComponent(companyName)}`,
                  )
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
            setToast({ open: true, message, intent: "success" });
            closeEditModal();
          }}
          onError={(message) => {
            setToast({ open: true, message, intent: "error" });
          }}
        />
      ) : null}

      <Toast
        trigger={<span aria-hidden style={{ display: "none" }} />}
        open={toast.open}
        onOpenChange={(open) => setToast((prev) => ({ ...prev, open }))}
        title={toast.message}
        intent={toast.intent}
      />
    </div>
  );
}
