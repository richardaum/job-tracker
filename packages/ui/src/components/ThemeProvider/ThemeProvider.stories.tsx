import type { Meta, StoryObj } from "@storybook/react";
import { cn } from "@ui/lib/cn";
import React from "react";

import { ThemeProvider, useTheme } from "./ThemeProvider";

function ThemeToggleDemo() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className={cn("flex flex-col gap-4 p-6")}>
      <p className={cn("text-sm text-text-secondary")}>
        Current theme:{" "}
        <strong className={cn("text-text-primary")}>{theme}</strong>
      </p>
      <button
        onClick={toggleTheme}
        className={cn(
          "rounded-md bg-bg-brand px-4 py-2 text-sm font-medium text-text-inverted",
        )}
      >
        Toggle theme
      </button>
      <div
        className={cn(
          "rounded-md border border-border-subtle bg-bg-surface p-4",
        )}
      >
        <p className={cn("text-sm text-text-primary")}>
          Surface with primary text
        </p>
        <p className={cn("text-sm text-text-secondary")}>Secondary text</p>
        <p className={cn("text-sm text-text-muted")}>Muted text</p>
      </div>
    </div>
  );
}

const meta: Meta<typeof ThemeProvider> = {
  title: "Foundations/ThemeProvider",
  component: ThemeProvider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LightMode: Story = {
  args: { defaultTheme: "light" },
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemeToggleDemo />
    </ThemeProvider>
  ),
};

export const DarkMode: Story = {
  args: { defaultTheme: "dark" },
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemeToggleDemo />
    </ThemeProvider>
  ),
};
