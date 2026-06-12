"use client";

import { tryRun } from "@job-tracker/try-run";
import { AnchoredCombobox, Button, cn, Dialog, Text } from "@job-tracker/ui";
import type { DialogControl } from "@job-tracker/ui";
import { useMemo, useState } from "react";

import { JobDocument, JobsDocument, useCompaniesQuery, useUpdateJobMutation } from "@/gql/hooks";

type CompanySelection = { type: "existing"; id: string; name: string } | { type: "create"; name: string };

interface CompanySwitchDialogProps {
  control: DialogControl;
  jobId: string;
  currentCompanyId?: string | null;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function CompanySwitchDialog({
  control,
  jobId,
  currentCompanyId,
  onSuccess,
  onError,
}: CompanySwitchDialogProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CompanySelection | null>(null);
  const [saving, setSaving] = useState(false);
  const { data: companiesData } = useCompaniesQuery();
  const [updateJob] = useUpdateJobMutation({
    refetchQueries: [{ query: JobDocument, variables: { id: jobId } }, { query: JobsDocument }],
  });

  const companyOptions = useMemo(
    () =>
      (companiesData?.companies ?? [])
        .filter((c) => c.id !== currentCompanyId)
        .map((c) => ({ label: c.name, value: c.id })),
    [companiesData, currentCompanyId],
  );

  const filteredOptions = useMemo(() => {
    if (!search) return companyOptions;
    return companyOptions.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
  }, [companyOptions, search]);

  const showCreateOption =
    search.trim().length > 0 && !companyOptions.some((o) => o.label.toLowerCase() === search.trim().toLowerCase());

  const hasItems = filteredOptions.length > 0 || showCreateOption;

  function handleSelectCompany(companyId: string, name: string) {
    setSelected({ type: "existing", id: companyId, name });
    setSearch(name);
  }

  function handleSelectCreate(name: string) {
    setSelected({ type: "create", name });
    setSearch(name);
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);

    if (selected.type === "existing") {
      const [error] = await tryRun(updateJob({ variables: { id: jobId, input: { companyId: selected.id } } }));
      if (error) {
        onError?.("Could not switch company.");
        setSaving(false);
        return;
      }
      onSuccess?.("Company updated.");
    } else {
      const [error] = await tryRun(updateJob({ variables: { id: jobId, input: { company: selected.name } } }));
      if (error) {
        onError?.("Could not create company.");
        setSaving(false);
        return;
      }
      onSuccess?.("Company created.");
    }

    control.close();
  }

  return (
    <Dialog
      title="Switch company"
      description="Select an existing company or create a new one."
      size="sm"
      open={control.isOpen}
      onOpenChange={(next) => {
        control.onOpenChange(next);
        if (next) {
          setSearch("");
          setSelected(null);
        }
      }}
    >
      <div className={cn("flex flex-col gap-4")}>
        <AnchoredCombobox.Root
          value={search}
          onValueChange={(text) => {
            setSearch(text);
            if (text !== selected?.name) setSelected(null);
          }}
          hasItems={hasItems}
        >
          <AnchoredCombobox.Input placeholder="Search or type a company name..." autoComplete="off" />
          <AnchoredCombobox.Portal>
            <AnchoredCombobox.Content className={cn("z-60")}>
              <AnchoredCombobox.List>
                {filteredOptions.map((option) => (
                  <AnchoredCombobox.Item
                    key={option.value}
                    textValue={option.label}
                    onSelect={() => handleSelectCompany(option.value, option.label)}
                    className={cn(
                      "flex w-full cursor-pointer items-center rounded-sm px-3 py-2 text-left outline-none",
                      "hover:bg-bg-surface-hover data-highlighted:bg-bg-surface-hover",
                    )}
                  >
                    <Text size="sm">{option.label}</Text>
                  </AnchoredCombobox.Item>
                ))}
                {showCreateOption && (
                  <AnchoredCombobox.Item
                    textValue={search.trim()}
                    onSelect={() => handleSelectCreate(search.trim())}
                    className={cn(
                      "flex w-full cursor-pointer items-center rounded-sm px-3 py-2 text-left outline-none",
                      "hover:bg-bg-surface-hover data-highlighted:bg-bg-surface-hover",
                    )}
                  >
                    <Text size="sm">
                      Create <strong>{search.trim()}</strong>
                    </Text>
                  </AnchoredCombobox.Item>
                )}
              </AnchoredCombobox.List>
            </AnchoredCombobox.Content>
          </AnchoredCombobox.Portal>
        </AnchoredCombobox.Root>

        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            size="md"
            onClick={() => void handleSave()}
            disabled={!selected || saving}
            state={saving ? "loading" : "default"}
          >
            Save
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
