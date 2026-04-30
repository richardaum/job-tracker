import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./Separator";
import { cn } from "@ui/lib/cn";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className={cn("w-80 rounded-lg bg-bg-surface p-6")}>
      <p className={cn("text-text-primary")}>Top</p>
      <div className={cn("py-2")}>
        <Separator />
      </div>
      <p className={cn("text-text-primary")}>Bottom</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div
      className={cn(
        "flex h-24 items-center gap-2 rounded-lg bg-bg-surface p-6",
      )}
    >
      <p className={cn("text-text-primary")}>Left</p>
      <Separator orientation="vertical" />
      <p className={cn("text-text-primary")}>Right</p>
    </div>
  ),
};
