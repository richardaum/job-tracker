import type { Meta, StoryObj } from "@storybook/react-vite";

import { InfoTooltip } from "./InfoTooltip";

const meta: Meta<typeof InfoTooltip> = {
  title: "Components/InfoTooltip",
  component: InfoTooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { content: "This is a helpful explanation." },
};

export const LongContent: Story = {
  args: {
    content:
      "Sequential processes pages one by one in order. NonSequential opens multiple pages in parallel for faster collection.",
  },
};
