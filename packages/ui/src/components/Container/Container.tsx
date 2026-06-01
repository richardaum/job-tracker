import type { ReactNode } from "react";
import { cn } from "@ui/lib/cn";

export interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return <div className={cn("mx-auto w-full max-w-5xl p-6 ")}>{children}</div>;
}
