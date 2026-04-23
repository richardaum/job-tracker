import React from "react";
import { cn } from "@ui/lib/cn";

export interface GoogleLoginButtonProps {
  onClick?: () => void;
}

export function GoogleLoginButton({ onClick }: GoogleLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border border-border-default bg-bg-surface px-5 py-3 font-medium text-text-primary shadow-sm transition-colors hover:bg-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0",
      )}
    >
      Continue with Google
    </button>
  );
}
