import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "./Stack";
import { cn } from "@ui/lib/cn";

const meta: Meta<typeof Stack> = {
  title: "Components/Stack",
  component: Stack,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Stack>
      <div
        className={cn(
          "rounded-md bg-bg-surface p-2 text-text-primary shadow-sm",
        )}
      >
        Item A
      </div>
      <div
        className={cn(
          "rounded-md bg-bg-surface p-2 text-text-primary shadow-sm",
        )}
      >
        Item B
      </div>
    </Stack>
  ),
};

export const Row: Story = {
  render: () => (
    <Stack direction="row" gap="xs" align="center">
      <div
        className={cn(
          "rounded-md bg-bg-surface p-2 text-text-primary shadow-sm",
        )}
      >
        Item A
      </div>
      <div
        className={cn(
          "rounded-md bg-bg-surface p-2 text-text-primary shadow-sm",
        )}
      >
        Item B
      </div>
    </Stack>
  ),
};
