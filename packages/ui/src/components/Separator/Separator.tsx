import * as RadixSeparator from "@radix-ui/react-separator";

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
}

export function Separator({ orientation = "horizontal" }: SeparatorProps) {
  return (
    <RadixSeparator.Root
      orientation={orientation}
      className={orientation === "horizontal" ? "h-px w-full bg-border-subtle" : "h-full w-px bg-border-subtle"}
    />
  );
}
