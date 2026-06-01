import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Tooltip } from "@ui/components/Tooltip/Tooltip";
import { cn } from "@ui/lib/cn";

export type IconButtonIntent = "primary" | "secondary" | "ghost" | "destructive" | "quiet";
export type IconButtonSize = "xs" | "sm" | "md";
export type IconButtonScheme = "brand" | "error" | "success" | "warning";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size" | "children"> {
  icon?: ReactNode;
  label: string;
  tooltip: ReactNode;
  intent?: IconButtonIntent;
  size?: IconButtonSize;
  colorScheme?: IconButtonScheme;
  asChild?: boolean;
  children?: ReactNode;
}

const defaultScheme: Record<IconButtonIntent, IconButtonScheme> = {
  primary: "brand",
  secondary: "brand",
  ghost: "brand",
  destructive: "error",
  quiet: "brand",
};

function resolveIntentClasses(intent: IconButtonIntent, scheme: IconButtonScheme): string {
  switch (intent) {
    case "primary":
      return `border-transparent bg-bg-${scheme} text-text-inverted hover:bg-bg-${scheme}-hover data-[state=open]:bg-bg-${scheme}-hover`;
    case "secondary":
      return "border-[1.5px] border-border-default bg-bg-surface text-text-primary hover:bg-bg-surface-hover data-[state=open]:bg-bg-surface-hover";
    case "ghost":
      return `border-transparent bg-transparent text-text-${scheme} shadow-none hover:bg-bg-${scheme}-subtle data-[state=open]:bg-bg-${scheme}-subtle`;
    case "destructive":
      return `border-border-${scheme} bg-bg-${scheme}-subtle text-text-${scheme} hover:bg-bg-surface data-[state=open]:bg-bg-surface`;
    case "quiet":
      return `border-transparent bg-transparent text-text-muted shadow-none hover:bg-bg-surface-hover${scheme === "brand" ? " hover:text-text-primary" : ` hover:text-text-${scheme}`} data-[state=open]:bg-bg-surface-hover`;
  }
}

const sizeClasses: Record<IconButtonSize, string> = { xs: "size-7", sm: "size-9", md: "size-10" };

export function IconButton({
  icon,
  label,
  tooltip,
  intent = "secondary",
  size = "md",
  colorScheme,
  className,
  asChild,
  children,
  ...props
}: IconButtonProps) {
  const Component = asChild ? Slot : "button";
  const scheme = colorScheme ?? defaultScheme[intent];
  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center rounded-md border shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60",
    resolveIntentClasses(intent, scheme),
    sizeClasses[size],
    className,
  );

  return (
    <Tooltip content={tooltip}>
      <Component {...(asChild ? {} : { type: "button" as const })} aria-label={label} className={classes} {...props}>
        {asChild ? children : <span aria-hidden>{icon}</span>}
      </Component>
    </Tooltip>
  );
}
