import { InfoIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@ui/components/Button/Button";
import { IconButton } from "@ui/components/IconButton/IconButton";

import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip content="This action updates your latest job stage.">
      <Button size="md" intent="secondary">
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
        icon={<InfoIcon size={16} weight="regular" />}
      />
    </Tooltip>
  ),
};
