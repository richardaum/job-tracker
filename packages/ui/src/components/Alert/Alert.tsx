"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { cn } from "@ui/lib/cn";

export type AlertIntent = "info" | "success" | "warning" | "error";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  intent?: AlertIntent;
  title?: string;
  icon?: ReactNode;
}

const intentClasses: Record<AlertIntent, string> = {
  info: "border-border-brand bg-bg-brand-subtle text-text-brand",
  success: "border-border-default bg-bg-success-subtle text-text-success",
  warning: "border-border-default bg-bg-warning-subtle text-text-warning",
  error: "border-border-error bg-bg-error-subtle text-text-error",
};

const intentIcons: Record<AlertIntent, ReactNode> = {
  info: <InfoIcon size={20} weight="regular" />,
  success: <CheckCircleIcon size={20} weight="regular" />,
  warning: <WarningCircleIcon size={20} weight="regular" />,
  error: <XCircleIcon size={20} weight="regular" />,
};

export function Alert({ intent = "info", title, icon, className, children, ...props }: AlertProps) {
  const classes = cn("flex items-start gap-2 rounded-md border p-4 shadow-sm", intentClasses[intent], className);

  return (
    <div role="alert" className={classes} {...props}>
      <span aria-hidden className={cn("pt-0.5")}>
        {icon ?? intentIcons[intent]}
      </span>
      <div className={cn("space-y-1")}>
        {title ? <p className={cn("text-sm font-semibold")}>{title}</p> : null}
        {children ? <div className={cn("text-sm")}>{children}</div> : null}
      </div>
    </div>
  );
}
