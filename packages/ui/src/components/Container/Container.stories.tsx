import type { Meta, StoryObj } from "@storybook/react-vite";
import { cn } from "@ui/lib/cn";

import { Container } from "./Container";

const meta: Meta<typeof Container> = {
  title: "Components/Container",
  component: Container,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Container>
      <div
        className={cn(
          "rounded-lg bg-bg-surface p-6 text-text-primary shadow-sm",
        )}
      >
        Container content
      </div>
    </Container>
  ),
};
