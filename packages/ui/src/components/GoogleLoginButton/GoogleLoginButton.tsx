import React from "react";

export interface GoogleLoginButtonProps {
  onClick?: () => void;
}

export function GoogleLoginButton({ onClick }: GoogleLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-inline-gap rounded-md border border-border-default bg-bg-surface px-button-x py-button-y-md font-medium text-text-primary shadow-sm transition-colors hover:bg-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2"
    >
      Continue with Google
    </button>
  );
}
