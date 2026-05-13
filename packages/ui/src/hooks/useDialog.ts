import { useCallback, useState } from "react";

export interface DialogControl {
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useDialog(initialOpen = false): DialogControl {
  const [open, setOpen] = useState(initialOpen);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const doOpen = useCallback(() => setOpen(true), []);
  const doClose = useCallback(() => setOpen(false), []);
  const doToggle = useCallback(() => setOpen((v) => !v), []);

  return {
    isOpen: open,
    onOpenChange: handleOpenChange,
    open: doOpen,
    close: doClose,
    toggle: doToggle,
  };
}
