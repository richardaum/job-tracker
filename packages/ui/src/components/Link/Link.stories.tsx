import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Link } from "./Link";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "View details", href: "#" } };

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Open dashboard
        <ArrowSquareOutIcon size={16} weight="regular" />
      </>
    ),
    href: "#",
  },
};

export const Muted: Story = { args: { children: "View history", href: "#", variant: "muted" } };
