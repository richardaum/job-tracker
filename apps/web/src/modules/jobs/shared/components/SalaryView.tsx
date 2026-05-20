import { cn, Text } from "@job-tracker/ui";

export function SalaryView({
  salary,
  className,
}: {
  salary?: string | null;
  className?: string;
}) {
  const lineStr = salary?.trim() ?? "";
  if (!lineStr) return null;

  return (
    <Text
      as="span"
      size="sm"
      color="success"
      className={cn("min-w-0", className)}
    >
      {lineStr}
    </Text>
  );
}
