import { Children } from "react";
import type { ReactNode } from "react";
import { Text } from "@ui/components/Typography/Text";
import { cn } from "@ui/lib/cn";

export type FieldWithLabelActionProps = {
  label: string;
  content: ReactNode;
  actions?: ReactNode | ReactNode[];
  className?: string;
};

export function FieldWithLabelAction({ label, content, actions, className }: FieldWithLabelActionProps) {
  const actionItems = Children.toArray(actions);
  const hasActions = actionItems.length > 0;

  return (
    <div className={cn("group", className)}>
      <div className={cn("flex min-h-7 items-center gap-1")}>
        <Text size="xs" color="muted">
          {label}
        </Text>
        {hasActions ? (
          <div className={cn("flex items-center gap-1")}>
            {actionItems.map((action, index) => (
              <div key={index} className={cn("shrink-0")}>
                {action}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className={cn("mt-1 min-w-0")}>{content}</div>
    </div>
  );
}
