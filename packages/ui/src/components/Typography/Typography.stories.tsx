import type { Meta, StoryObj } from "@storybook/react-vite";
import { cn } from "@ui/lib/cn";

import { Heading } from "./Heading";
import { Text } from "./Text";

const meta: Meta = { title: "Foundations/Typography", parameters: { layout: "padded" }, tags: ["autodocs"] };

export default meta;
type Story = StoryObj<typeof meta>;

export const HeadingScale: Story = {
  render: () => (
    <div className={cn("flex flex-col gap-4")}>
      <Heading as="h1" size="4xl">
        Heading 4xl — h1
      </Heading>
      <Heading as="h2" size="3xl">
        Heading 3xl — h2
      </Heading>
      <Heading as="h3" size="2xl">
        Heading 2xl — h3
      </Heading>
      <Heading as="h4" size="xl">
        Heading xl — h4
      </Heading>
      <Heading as="h5" size="lg">
        Heading lg — h5
      </Heading>
      <Heading as="h6" size="base">
        Heading base — h6
      </Heading>
    </div>
  ),
};

export const TextSizes: Story = {
  render: () => (
    <div className={cn("flex flex-col gap-3")}>
      <Text size="lg">Text lg — body large</Text>
      <Text size="md">Text md — body default</Text>
      <Text size="base">Text base</Text>
      <Text size="sm">Text sm — caption</Text>
      <Text size="xs">Text xs — micro</Text>
    </div>
  ),
};

export const TextWeights: Story = {
  render: () => (
    <div className={cn("flex flex-col gap-3")}>
      <Text weight="bold">Bold weight</Text>
      <Text weight="semibold">Semibold weight</Text>
      <Text weight="medium">Medium weight</Text>
      <Text weight="regular">Regular weight</Text>
    </div>
  ),
};

export const TextColors: Story = {
  render: () => (
    <div className={cn("flex flex-col gap-3")}>
      <Text color="primary">Primary color</Text>
      <Text color="secondary">Secondary color</Text>
      <Text color="muted">Muted color</Text>
      <Text color="brand">Brand color</Text>
      <Text color="error">Error color</Text>
      <Text color="success">Success color</Text>
    </div>
  ),
};
