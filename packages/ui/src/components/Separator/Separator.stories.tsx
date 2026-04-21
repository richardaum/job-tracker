import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./Separator";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-80 rounded-lg bg-bg-surface p-card-padding">
      <p className="text-text-primary">Top</p>
      <div className="py-inline-gap">
        <Separator />
      </div>
      <p className="text-text-primary">Bottom</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-24 items-center gap-inline-gap rounded-lg bg-bg-surface p-card-padding">
      <p className="text-text-primary">Left</p>
      <Separator orientation="vertical" />
      <p className="text-text-primary">Right</p>
    </div>
  ),
};
