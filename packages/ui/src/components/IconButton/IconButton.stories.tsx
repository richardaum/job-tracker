import { Bell, Trash } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";

import { IconButton } from "./IconButton";

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Notifications",
    tooltip: "Notifications",
    icon: <Bell size={20} weight="regular" />,
  },
};

export const Destructive: Story = {
  args: {
    label: "Delete",
    tooltip: "Delete",
    intent: "destructive",
    icon: <Trash size={20} weight="regular" />,
  },
};
