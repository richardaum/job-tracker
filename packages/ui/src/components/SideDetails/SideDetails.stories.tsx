import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@ui/components/Button/Button";
import { Stack } from "@ui/components/Stack/Stack";
import { Text } from "@ui/components/Typography/Text";
import { cn } from "@ui/lib/cn";
import { useState } from "react";
import type { ComponentProps } from "react";

import { SideDetails } from "./SideDetails";

function StatefulSideDetailsStory({
  side,
  layout = "overlay",
}: {
  side?: ComponentProps<typeof SideDetails>["side"];
  layout?: ComponentProps<typeof SideDetails>["layout"];
}) {
  const [open, setOpen] = useState(layout === "inline");
  return (
    <div
      className={cn(
        layout === "inline"
          ? "flex size-full max-h-128 min-h-80 max-w-4xl gap-0 border border-border-subtle"
          : "contents",
      )}
    >
      {layout === "inline" ? (
        <Stack
          gap="sm"
          className={cn(
            "min-h-0 min-w-0 flex-1 shrink overflow-auto border-r border-border-subtle bg-bg-field p-4",
          )}
        >
          <Text size="sm" weight="semibold">
            List column
          </Text>
          <Text size="sm" color="secondary">
            Select a template label to reopen the pane from the toolbar if you
            closed it.
          </Text>
          <Button
            type="button"
            intent="outlined"
            size="sm"
            onClick={() => setOpen(true)}
          >
            Open inline SideDetails
          </Button>
        </Stack>
      ) : (
        <Button type="button" onClick={() => setOpen(true)}>
          Open SideDetails
        </Button>
      )}
      <SideDetails
        layout={layout}
        open={open}
        onOpenChange={setOpen}
        title="Importer template"
        description="Configurable run settings and history belong here."
        side={side}
        footer={
          <div className={cn("flex justify-end gap-2")}>
            <Button
              intent="secondary"
              type="button"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            <Button intent="primary" type="button">
              Placeholder action
            </Button>
          </div>
        }
      >
        <Stack gap="sm">
          <Text size="sm" color="secondary">
            Plug any layout into this body; the chrome stays generic for list →
            panel flows across the product.
          </Text>
          <Button intent="outlined" size="sm" type="button">
            Another control
          </Button>
        </Stack>
      </SideDetails>
    </div>
  );
}

const meta: Meta<typeof StatefulSideDetailsStory> = {
  title: "Components/SideDetails",
  component: StatefulSideDetailsStory,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'Default layout is modal slide-over (`layout="overlay"`, Radix Dialog). Use `layout="inline"` for a pane that shares flex space with sibling content — no backdrop.',
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <StatefulSideDetailsStory /> };

export const FromLeft: Story = {
  render: () => <StatefulSideDetailsStory side="left" />,
};

export const InlineBesideList: Story = {
  parameters: { layout: "padded" },
  render: () => <StatefulSideDetailsStory layout="inline" side="right" />,
};
