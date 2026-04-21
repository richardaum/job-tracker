import type { Meta, StoryObj } from "@storybook/react";
import { DotsThreeOutlineVertical } from "@phosphor-icons/react";
import { IconButton } from "../IconButton/IconButton";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./DropdownMenu";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    layout: "centered",
  },
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
          icon={<DotsThreeOutlineVertical size={16} weight="regular" />}
        />
      }
    >
      <DropdownMenuItem>Edit application</DropdownMenuItem>
      <DropdownMenuItem>Duplicate</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem destructive>Delete</DropdownMenuItem>
    </DropdownMenu>
  ),
};
