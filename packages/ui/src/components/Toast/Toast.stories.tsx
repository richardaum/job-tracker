import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Toast } from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    trigger: <Button>Show toast</Button>,
    intent: "success",
    title: "Application saved",
    description: "Your updates are now available.",
    actionLabel: "Undo",
  },
};
