import type { Meta, StoryObj } from "@storybook/react";

import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    title: "Profile note",
    children: "Your profile visibility is set to public.",
    intent: "info",
  },
};

export const Success: Story = {
  args: {
    title: "Saved",
    children: "Application details were updated.",
    intent: "success",
  },
};

export const Warning: Story = {
  args: {
    title: "Missing field",
    children: "Add a salary expectation to improve matching.",
    intent: "warning",
  },
};

export const Error: Story = {
  args: {
    title: "Failed to save",
    children: "Try again in a few seconds.",
    intent: "error",
  },
};
