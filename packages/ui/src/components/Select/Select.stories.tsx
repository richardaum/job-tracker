import type { Meta, StoryObj } from "@storybook/react-vite";

import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { label: "Applied", value: "applied" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
];

export const Default: Story = {
  args: { placeholder: "Select stage", options },
};

export const Error: Story = {
  args: { placeholder: "Select stage", options, state: "error" },
};
