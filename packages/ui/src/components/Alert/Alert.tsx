import React from "react";
import {
  CheckCircle,
  Info,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";

export type AlertIntent = "info" | "success" | "warning" | "error";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  intent?: AlertIntent;
  title?: string;
  icon?: React.ReactNode;
}

const intentClasses: Record<AlertIntent, string> = {
  info: "border-border-brand bg-bg-brand-subtle text-text-brand",
  success: "border-border-default bg-bg-success-subtle text-text-success",
  warning: "border-border-default bg-bg-warning-subtle text-text-warning",
  error: "border-border-error bg-bg-error-subtle text-text-error",
};

const intentIcons: Record<AlertIntent, React.ReactNode> = {
  info: <Info size={20} weight="regular" />,
  success: <CheckCircle size={20} weight="regular" />,
  warning: <WarningCircle size={20} weight="regular" />,
  error: <XCircle size={20} weight="regular" />,
};

export function Alert({
  intent = "info",
  title,
  icon,
  className,
  children,
  ...props
}: AlertProps) {
  const classes = [
    "flex items-start gap-inline-gap rounded-md border p-4 shadow-sm",
    intentClasses[intent],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div role="alert" className={classes} {...props}>
      <span aria-hidden className="pt-0.5">
        {icon ?? intentIcons[intent]}
      </span>
      <div className="space-y-1">
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {children ? <div className="text-sm">{children}</div> : null}
      </div>
    </div>
  );
}
