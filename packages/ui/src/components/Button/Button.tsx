import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-inline-gap rounded-md bg-bg-brand px-button-x py-button-y-md font-medium text-text-inverted shadow-sm transition-colors hover:bg-bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2"
    >
      {children}
    </button>
  );
}
