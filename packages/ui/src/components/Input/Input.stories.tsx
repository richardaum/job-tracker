import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter your email",
  },
};

export const Error: Story = {
  args: {
    placeholder: "Enter your email",
    state: "error",
    value: "invalid-email",
    readOnly: true,
  },
};
