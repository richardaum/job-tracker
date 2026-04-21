import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Dialog } from "./Dialog";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
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
    children: <p className="text-sm text-text-secondary">Are you sure?</p>,
    footer: (
      <div className="flex justify-end gap-inline-gap">
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
