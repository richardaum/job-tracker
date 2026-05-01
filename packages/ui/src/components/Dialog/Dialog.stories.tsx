import type { Meta, StoryObj } from "@storybook/react";
import { cn } from "@ui/lib/cn";

import { Button } from "../Button/Button";
import { Stack } from "../Stack/Stack";
import { Text } from "../Typography/Text";
import { Dialog } from "./Dialog";

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
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"],
      description: "Controls the maximum width of the dialog content.",
    },
  },
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

export const Sizes: Story = {
  render: () => (
    <Stack gap="md" align="start">
      {(["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const).map(
        (size) => (
          <Dialog
            key={size}
            size={size}
            trigger={<Button size="sm">Open {size} dialog</Button>}
            title={`${size.toUpperCase()} Dialog`}
          >
            <div className={cn("py-10 text-center")}>
              <Text>This is a {size} sized dialog.</Text>
            </div>
          </Dialog>
        ),
      )}
    </Stack>
  ),
};
