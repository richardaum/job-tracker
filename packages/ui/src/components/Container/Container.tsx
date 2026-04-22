import React from "react";
import { cn } from "@ui/lib/cn";

export interface ContainerProps {
  children: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-6 py-6")}>{children}</div>
  );
}
