import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@ui/components/Button/Button";

import { ConfirmDialog } from "./ConfirmDialog";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Components/ConfirmDialog",
  component: ConfirmDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Use for destructive or irreversible actions. Do not use `window.confirm` / `window.alert` in app code.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button size="sm">Delete something</Button>,
    title: "Delete application",
    description:
      'Are you sure you want to delete "Senior engineer"? This cannot be undone.',
    onConfirm: async () => {
      await new Promise((r) => setTimeout(r, 400));
    },
  },
};

export const PrimaryConfirm: Story = {
  args: {
    trigger: <Button size="sm">Proceed</Button>,
    title: "Submit responses?",
    description: "You will not be able to edit answers after submitting.",
    confirmLabel: "Submit",
    confirmIntent: "primary",
    onConfirm: async () => {
      await new Promise((r) => setTimeout(r, 200));
    },
  },
};
