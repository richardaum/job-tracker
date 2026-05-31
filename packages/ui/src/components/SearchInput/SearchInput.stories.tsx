import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Components/SearchInput",
  component: SearchInput,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DisplayOnly: Story = { args: { placeholder: "Search jobs...", shortcutHint: "⌘/" } };

function InteractiveSearchInput(args: React.ComponentProps<typeof SearchInput>) {
  const [value, setValue] = useState("");

  return (
    <div style={{ width: "320px" }}>
      <SearchInput {...args} value={value} onChange={(event) => setValue(event.target.value)} />
    </div>
  );
}

export const Interactive: Story = {
  args: { placeholder: "Search companies...", ariaLabel: "Search companies", shortcutHint: null },
  render: (args: React.ComponentProps<typeof SearchInput>) => <InteractiveSearchInput {...args} />,
};
