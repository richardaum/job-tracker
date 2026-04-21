import React from "react";

export interface ContainerProps {
  children: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-card-padding py-section-gap">
      {children}
    </div>
  );
}
