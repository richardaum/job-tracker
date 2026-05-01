import type { Meta, StoryObj } from "@storybook/react";
import { cn } from "@ui/lib/cn";

import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className={cn("flex items-center gap-2")}>
      <Checkbox id="accept" />
      <label htmlFor="accept" className={cn("text-sm text-text-secondary")}>
        Accept terms
      </label>
    </div>
  ),
};

export const Error: Story = { args: { state: "error" } };
