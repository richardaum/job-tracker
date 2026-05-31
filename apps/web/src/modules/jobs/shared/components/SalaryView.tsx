import { cn, Text } from "@job-tracker/ui";

type SalaryViewProps = { salary?: string | null; className?: string };
export function SalaryView({ salary, className }: SalaryViewProps) {
  const lineStr = salary?.trim() ?? "";
  if (!lineStr) return null;

  return (
    <Text as="span" size="sm" color="success" className={cn("min-w-0", className)}>
      {lineStr}
    </Text>
  );
}
