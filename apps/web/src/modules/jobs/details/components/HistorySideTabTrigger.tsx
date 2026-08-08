import { cn, TabsTrigger } from "@job-tracker/ui";

export function HistorySideTabTrigger() {
  return (
    <TabsTrigger value="history" className={cn("flex-1")}>
      Status
    </TabsTrigger>
  );
}
