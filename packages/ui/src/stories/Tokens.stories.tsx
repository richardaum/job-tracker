import type { Meta, StoryObj } from "@storybook/react";
import { cn } from "@ui/lib/cn";
import React from "react";

type ColorToken = { name: string; cssVar: string };

const primitiveColors: ColorToken[] = [
  { name: "brand-50", cssVar: "--primitive-color-brand-50" },
  { name: "brand-100", cssVar: "--primitive-color-brand-100" },
  { name: "brand-600", cssVar: "--primitive-color-brand-600" },
  { name: "neutral-0", cssVar: "--primitive-color-neutral-0" },
  { name: "neutral-100", cssVar: "--primitive-color-neutral-100" },
  { name: "neutral-900", cssVar: "--primitive-color-neutral-900" },
  { name: "green-600", cssVar: "--primitive-color-green-600" },
  { name: "red-600", cssVar: "--primitive-color-red-600" },
  { name: "yellow-600", cssVar: "--primitive-color-yellow-600" },
];

const semanticColors: ColorToken[] = [
  { name: "text-primary", cssVar: "--semantic-color-text-primary" },
  { name: "text-secondary", cssVar: "--semantic-color-text-secondary" },
  { name: "bg-surface", cssVar: "--semantic-color-bg-surface" },
  { name: "bg-brand", cssVar: "--semantic-color-bg-brand" },
  { name: "border-default", cssVar: "--semantic-color-border-default" },
  { name: "border-brand", cssVar: "--semantic-color-border-brand" },
];

function ColorGrid({ title, tokens }: { title: string; tokens: ColorToken[] }) {
  return (
    <section className={cn("space-y-3")}>
      <h3 className={cn("text-lg font-semibold text-text-primary")}>{title}</h3>
      <div
        className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3")}
      >
        {tokens.map((token) => (
          <div
            key={token.name}
            className={cn(
              "rounded-lg border border-border-subtle bg-bg-surface p-6 shadow-sm",
            )}
          >
            <div
              className={cn(
                "mb-2 h-12 w-full rounded-md border border-border-subtle",
              )}
              style={{ backgroundColor: `var(${token.cssVar})` }}
            />
            <p className={cn("font-mono text-sm text-text-primary")}>
              {token.name}
            </p>
            <p className={cn("font-mono text-xs text-text-secondary")}>
              {token.cssVar}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TokensShowcase() {
  return (
    <div className={cn("space-y-6 bg-bg-surface p-6 font-sans")}>
      <section className={cn("space-y-2")}>
        <h2 className={cn("text-2xl font-bold text-text-primary")}>
          Design Tokens
        </h2>
        <p className={cn("max-w-3xl text-sm text-text-secondary")}>
          Foundations are documented in two layers: primitive values and
          semantic aliases. Component-specific defaults stay close to each
          component implementation for easier debugging.
        </p>
      </section>

      <ColorGrid title="Primitive Color Tokens" tokens={primitiveColors} />
      <ColorGrid title="Semantic Color Tokens" tokens={semanticColors} />

      <section className={cn("space-y-3")}>
        <h3 className={cn("text-lg font-semibold text-text-primary")}>
          Typography and Spacing Samples
        </h3>
        <div
          className={cn(
            "rounded-lg border border-border-subtle bg-bg-surface p-6 shadow-sm",
          )}
        >
          <p className={cn("text-2xl font-bold text-text-primary")}>
            Page Title Token
          </p>
          <p className={cn("text-sm text-text-secondary")}>
            Body copy token sample using semantic text colors and spacing.
          </p>
          <div
            className={cn(
              "mt-4 inline-flex items-center gap-2 rounded-full bg-bg-brand-subtle px-5 py-2 text-sm font-medium text-text-brand",
            )}
          >
            Semantic spacing + semantic colors
          </div>
        </div>
      </section>
    </div>
  );
}

const meta: Meta<typeof TokensShowcase> = {
  title: "Foundations/Tokens",
  component: TokensShowcase,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
