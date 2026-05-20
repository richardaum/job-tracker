import { useAsyncEffect } from "@job-tracker/ui";
import { type JSX, useState } from "react";

import { MenuActionButton } from "./menu/MenuActionButton";
import { MenuPanel } from "./menu/MenuPanel";
import { useMenuKeyboardNavigation } from "./useMenuKeyboardNavigation";

type PopupMessage = { kind: "popup.trigger-plan-service" };
type PopupImportMessage = { kind: "popup.import-job" };
type PopupImportLabelMessage = { kind: "popup.get-import-menu-label" };
type PopupImportLabelResponse = { label: string };

export function PopupMenu(): JSX.Element {
  const [importJobLabel, setImportJobLabel] = useState("Import job");

  useAsyncEffect(async () => {
    const message: PopupImportLabelMessage = {
      kind: "popup.get-import-menu-label",
    };

    const response = await chrome.runtime.sendMessage<
      PopupImportLabelMessage,
      PopupImportLabelResponse
    >(message);
    if (response?.label) {
      setImportJobLabel(response.label);
    }
  }, []);

  const handleTriggerPlanService = async () => {
    const message: PopupMessage = { kind: "popup.trigger-plan-service" };
    await chrome.runtime.sendMessage(message);
    window.close();
  };

  const handleImportJob = async () => {
    const message: PopupImportMessage = { kind: "popup.import-job" };
    await chrome.runtime.sendMessage(message);
    window.close();
  };
  const menuItems = [
    { label: importJobLabel, onClick: handleImportJob },
    { label: "Trigger PlanService", onClick: handleTriggerPlanService },
  ] as const;

  const {
    menuRef,
    isKeyboardMode,
    getItemRef,
    handleMouseNavigationStart,
    handleMenuKeyDown,
  } = useMenuKeyboardNavigation({
    itemCount: menuItems.length,
    onEscape: () => window.close(),
  });

  return (
    <MenuPanel
      menuRef={menuRef}
      onKeyDown={handleMenuKeyDown}
      ariaLabel="Job Tracker actions"
    >
      {menuItems.map((item, index) => (
        <MenuActionButton
          key={item.label}
          itemRef={getItemRef(index)}
          isKeyboardMode={isKeyboardMode}
          onMouseEnter={handleMouseNavigationStart}
          onClick={item.onClick}
        >
          {item.label}
        </MenuActionButton>
      ))}
    </MenuPanel>
  );
}
