import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@ui/components/Button/Button";

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
    title: "Job saved",
    description: "Your updates are now available.",
    actionLabel: "Undo",
  },
};

export const Queue: Story = {
  args: {
    toasts: [
      { id: "a", intent: "info", title: "Import running" },
      {
        id: "b",
        intent: "success",
        title: "Job saved",
        description: "The item is now available in your list.",
      },
    ],
  },
};
