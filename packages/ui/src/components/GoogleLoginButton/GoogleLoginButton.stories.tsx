import type { Meta, StoryObj } from "@storybook/react";
import { GoogleLoginButton } from "./GoogleLoginButton";

const meta: Meta<typeof GoogleLoginButton> = {
  title: "Components/GoogleLoginButton",
  component: GoogleLoginButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
