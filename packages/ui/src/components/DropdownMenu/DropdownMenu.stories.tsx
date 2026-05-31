import {
  CopyIcon,
  DotsThreeOutlineVerticalIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "@ui/components/IconButton/IconButton";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./DropdownMenu";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu
      trigger={
        <IconButton
          label="Open actions menu"
          tooltip="Open actions menu"
          icon={<DotsThreeOutlineVerticalIcon size={16} weight="regular" />}
        />
      }
    >
      <DropdownMenuItem icon={<PencilSimpleIcon size={14} weight="regular" />}>
        Edit job
      </DropdownMenuItem>
      <DropdownMenuItem icon={<CopyIcon size={14} weight="regular" />}>
        Duplicate
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        destructive
        icon={<TrashIcon size={14} weight="regular" />}
      >
        Delete
      </DropdownMenuItem>
    </DropdownMenu>
  ),
};
