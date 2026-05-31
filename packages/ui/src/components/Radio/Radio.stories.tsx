import type { Meta, StoryObj } from "@storybook/react-vite";
import { cn } from "@ui/lib/cn";

import { Radio } from "./Radio";

const meta: Meta<typeof Radio> = {
  title: "Components/Radio",
  component: Radio,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const fruitOptions = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
];

export const Default: Story = {
  args: { options: fruitOptions, defaultValue: "apple" },
};

export const Horizontal: Story = {
  args: {
    options: [
      { label: "Sequential", value: "sequential" },
      { label: "NonSequential", value: "nonsequential" },
    ],
    defaultValue: "sequential",
    orientation: "horizontal",
  },
};

export const Vertical: Story = {
  args: {
    options: fruitOptions,
    defaultValue: "banana",
    orientation: "vertical",
  },
};

export const Disabled: Story = {
  args: { options: fruitOptions, defaultValue: "apple", disabled: true },
};

export const CustomStyled: Story = {
  render: () => (
    <div className={cn("flex flex-col gap-6")}>
      <Radio
        options={[
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ]}
        defaultValue="md"
        orientation="horizontal"
      />
      <Radio
        options={[
          { label: "Option A", value: "a" },
          { label: "Option B", value: "b" },
        ]}
        defaultValue="a"
        orientation="vertical"
      />
    </div>
  ),
};
