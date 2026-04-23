import type { Meta, StoryObj } from "@storybook/react";
import { Info } from "@phosphor-icons/react";
import { Button } from "../Button/Button";
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
      <Button size="sm" intent="secondary">
        Hover me
      </Button>
    </Tooltip>
  ),
};

export const WithIconButton: Story = {
  render: () => (
    <Tooltip content="Container tooltip">
      <IconButton
        label="More info"
        tooltip="More info"
        icon={<Info size={16} weight="regular" />}
      />
    </Tooltip>
  ),
};
