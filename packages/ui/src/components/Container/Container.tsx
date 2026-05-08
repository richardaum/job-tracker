import { cn } from "@ui/lib/cn";
import React from "react";

export interface ContainerProps {
  children: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  return <div className={cn("mx-auto w-full max-w-5xl p-6 ")}>{children}</div>;
}
