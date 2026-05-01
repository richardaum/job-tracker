import { ArrowRight, FloppyDisk } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "Click me" } };

export const Secondary: Story = {
  args: { children: "Secondary", intent: "secondary" },
};

export const Outlined: Story = {
  args: { children: "Outlined", intent: "outlined" },
};

export const Destructive: Story = {
  args: { children: "Delete", intent: "destructive" },
};

export const Loading: Story = {
  args: {
    children: "Saving...",
    state: "loading",
    leftIcon: <FloppyDisk size={16} weight="regular" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: "Continue",
    rightIcon: <ArrowRight size={16} weight="regular" />,
  },
};
