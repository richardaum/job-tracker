import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@ui/components/Input/Input";
import { cn } from "@ui/lib/cn";

import { FormField } from "./FormField";

const meta: Meta<typeof FormField> = {
  title: "Components/FormField",
  component: FormField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className={cn("w-80")}>
      <FormField
        label="Email"
        htmlFor="email"
        hint="We will never share your email."
      >
        <Input id="email" placeholder="you@example.com" />
      </FormField>
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className={cn("w-80")}>
      <FormField
        label="Email"
        htmlFor="email"
        error="Please provide a valid email."
        required
      >
        <Input id="email" state="error" placeholder="you@example.com" />
      </FormField>
    </div>
  ),
};
