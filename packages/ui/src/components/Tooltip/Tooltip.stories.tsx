import type { Meta, StoryObj } from "@storybook/react";
import { Info } from "@phosphor-icons/react";
import { IconButton } from "../IconButton/IconButton";
import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip content="This action updates your latest application stage.">
      <IconButton
        label="More info"
        icon={<Info size={16} weight="regular" />}
      />
    </Tooltip>
  ),
};
