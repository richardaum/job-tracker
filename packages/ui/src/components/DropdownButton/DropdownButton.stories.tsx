import {
  CopyIcon,
  FloppyDiskIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@ui/components/DropdownMenu/DropdownMenu";

import { DropdownButton } from "./DropdownButton";

const meta: Meta<typeof DropdownButton> = {
  title: "Components/DropdownButton",
  component: DropdownButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    intent: {
      control: "select",
      options: ["primary", "secondary", "ghost", "outlined", "destructive"],
    },
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    align: { control: "select", options: ["start", "center", "end"] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const menuContent = (
  <>
    <DropdownMenuItem icon={<FloppyDiskIcon size={14} weight="regular" />}>
      Save
    </DropdownMenuItem>
    <DropdownMenuItem icon={<CopyIcon size={14} weight="regular" />}>
      Save as
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem
      destructive
      icon={<TrashIcon size={14} weight="regular" />}
    >
      Delete
    </DropdownMenuItem>
  </>
);

export const Primary: Story = {
  args: { children: "Apply", content: menuContent },
};

export const Secondary: Story = {
  args: { children: "Apply", content: menuContent, intent: "secondary" },
};

export const Ghost: Story = {
  args: { children: "Actions", content: menuContent, intent: "ghost" },
};

export const Outlined: Story = {
  args: { children: "Apply", content: menuContent, intent: "outlined" },
};

export const Destructive: Story = {
  args: { children: "Delete", content: menuContent, intent: "destructive" },
};

export const WithIcon: Story = {
  args: { children: <PlusIcon size={16} weight="bold" />, content: menuContent },
};

export const Small: Story = {
  args: { children: "Small", content: menuContent, size: "lg" },
};

export const ExtraSmall: Story = {
  args: { children: "XS", content: menuContent, size: "md" },
};
