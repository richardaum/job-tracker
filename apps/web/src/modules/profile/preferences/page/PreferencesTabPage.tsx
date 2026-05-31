"use client";

import { Button, cn } from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";

import { ProfileHeaderActions } from "@/modules/profile/layout/profile-header.slots";
import WorkPreferencesEditor from "@/modules/work-preferences/components/WorkPreferencesEditor";

type AddAction = { add: () => void; disabled: boolean };

export default function PreferencesTabPage() {
  const [addAction, setAddAction] = useState<AddAction | null>(null);

  const handleAddActionChange = useCallback((action: AddAction | null) => {
    setAddAction(action);
  }, []);

  return (
    <>
      {addAction ? (
        <ProfileHeaderActions>
          <Button intent="primary" size="md" onClick={addAction.add} disabled={addAction.disabled}>
            <PlusIcon size={16} weight="bold" className={cn("mr-2")} />
            Add preference
          </Button>
        </ProfileHeaderActions>
      ) : null}
      <WorkPreferencesEditor mode="inline" onAddActionChange={handleAddActionChange} />
    </>
  );
}
