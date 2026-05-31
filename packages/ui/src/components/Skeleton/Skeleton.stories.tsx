import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = { args: { variant: "text", className: "w-48" } };

export const Rectangle: Story = { args: { variant: "rect", className: "w-64" } };

export const Circle: Story = { args: { variant: "circle" } };
