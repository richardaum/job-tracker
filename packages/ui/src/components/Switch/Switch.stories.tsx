import type { Meta, StoryObj } from "@storybook/react-vite";
import { cn } from "@ui/lib/cn";

import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className={cn("flex items-center gap-2")}>
      <Switch id="notifications" />
      <label
        htmlFor="notifications"
        className={cn("text-sm text-text-secondary")}
      >
        Enable notifications
      </label>
    </div>
  ),
};

export const Checked: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };
