import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Dialog } from "./Dialog";
import { cn } from "@ui/lib/cn";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Low-level modal shell. For yes/no confirmations (especially destructive actions), prefer **ConfirmDialog** instead of composing Cancel/Delete footers by hand.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button size="sm">Open dialog</Button>,
    title: "Delete application",
    description:
      "This action cannot be undone. You will permanently remove this application.",
    children: (
      <p className={cn("text-sm text-text-secondary")}>Are you sure?</p>
    ),
    footer: (
      <div className={cn("flex justify-end gap-2")}>
        <Button size="sm" intent="secondary">
          Cancel
        </Button>
        <Button size="sm" intent="destructive">
          Delete
        </Button>
      </div>
    ),
  },
};
