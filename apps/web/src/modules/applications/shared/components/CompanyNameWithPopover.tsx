"use client";

import React from "react";
import { Popover, Text, cn } from "@job-tracker/ui";
import { FieldEditTriggerButton } from "@/modules/applications/details/components/HoverEditableFieldRow";
import { TipTapContent } from "./TipTapContent";

interface CompanyNameWithPopoverProps {
  name: string;
  description?: string | null;
  className?: string;
  onEditDescription?: () => void;
}

export function CompanyNameWithPopover({
  name,
  description,
  className,
  onEditDescription,
}: CompanyNameWithPopoverProps) {
  const hasDescription = Boolean(description);

  return (
    <Popover
      enabled={true}
      align="start"
      trigger={
        <Text
          as="p"
          size="sm"
          color="secondary"
          className={cn(
            "cursor-pointer decoration-text-muted/50 decoration-dotted underline-offset-4 hover:underline",
            className,
          )}
        >
          {name}
        </Text>
      }
    >
      <div className={cn("group max-w-xs p-1")}>
        <div className={cn("mb-2 flex items-center gap-1")}>
          <Text
            size="xs"
            weight="semibold"
            color="muted"
            className="block uppercase tracking-wider"
          >
            About the company
          </Text>
          {onEditDescription && (
            <FieldEditTriggerButton
              label={hasDescription ? "Edit description" : "Add description"}
              onClick={(e) => {
                e.stopPropagation();
                onEditDescription();
              }}
              className="h-6 w-6 opacity-100"
            />
          )}
        </div>
        {hasDescription ? (
          <TipTapContent
            content={description}
            className="text-xs text-text-secondary leading-relaxed"
          />
        ) : (
          <Text size="xs" color="muted" className="italic">
            No description available.
          </Text>
        )}
      </div>
    </Popover>
  );
}
