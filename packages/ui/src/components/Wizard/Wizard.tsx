import { cn } from "@ui/lib/cn";
import React from "react";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

interface WizardContextValue {
  steps: WizardStep[];
  currentStep: number;
  onStepChange?: (index: number) => void;
}

const WizardContext = React.createContext<WizardContextValue | null>(null);

function useWizardContext() {
  const context = React.useContext(WizardContext);
  if (!context) {
    throw new Error("Wizard components must be used inside <Wizard>.");
  }
  return context;
}

export interface WizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange?: (index: number) => void;
  children: React.ReactNode;
  className?: string;
}

export function Wizard({
  steps,
  currentStep,
  onStepChange,
  children,
  className,
}: WizardProps) {
  return (
    <WizardContext.Provider value={{ steps, currentStep, onStepChange }}>
      <div
        className={cn(
          "grid grid-cols-1 gap-5 md:grid-cols-[minmax(160px,20vw)_1fr]",
          className,
        )}
      >
        {children}
      </div>
    </WizardContext.Provider>
  );
}

export interface WizardSidebarProps {
  className?: string;
}

export function WizardSidebar({ className }: WizardSidebarProps) {
  const { steps, currentStep, onStepChange } = useWizardContext();

  return (
    <aside className={cn("border-r border-border-subtle pr-3", className)}>
      <div className={cn("flex flex-col gap-2")}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange?.(index)}
              className={cn(
                "w-full rounded-md border px-3 py-2 text-left transition-colors",
                isActive
                  ? "border-border-brand bg-bg-brand-subtle"
                  : "border-border-subtle bg-bg-surface hover:bg-bg-surface-hover",
              )}
            >
              <div className={cn("text-sm font-medium text-text-primary")}>
                {step.title}
              </div>
              {step.description ? (
                <div className={cn("mt-0.5 text-xs text-text-secondary")}>
                  {step.description}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export interface WizardMainProps {
  className?: string;
  children: React.ReactNode;
}

export function WizardMain({ className, children }: WizardMainProps) {
  return <section className={cn("min-w-0", className)}>{children}</section>;
}
