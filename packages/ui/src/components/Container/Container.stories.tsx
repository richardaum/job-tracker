import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "./Container";
import { cn } from "@ui/lib/cn";

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
