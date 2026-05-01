import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "Applied" } };

export const Success: Story = {
  args: { children: "Offer", intent: "success" },
};

export const Warning: Story = {
  args: { children: "Pending", intent: "warning" },
};

export const Error: Story = { args: { children: "Rejected", intent: "error" } };
