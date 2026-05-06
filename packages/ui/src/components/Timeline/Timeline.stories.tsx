import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "@ui/components/Typography/Text";
import { cn } from "@ui/lib/cn";

import {
  Timeline,
  TimelineContent,
  TimelineItem,
  TimelineMarker,
} from "./Timeline";

const meta: Meta<typeof Timeline> = {
  title: "Components/Timeline",
  component: Timeline,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className={cn("w-80")}>
      <Timeline>
        <TimelineItem>
          <TimelineMarker showBottomConnector dotClassName="text-text-brand" />
          <TimelineContent>
            <Text size="sm" weight="medium">
              Applied
            </Text>
            <Text size="xs" color="muted">
              Apr 18, 2026
            </Text>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineMarker showTopConnector dotClassName="text-text-warning" />
          <TimelineContent>
            <Text size="sm" weight="medium">
              Recruiter Screen
            </Text>
            <Text size="xs" color="muted">
              Apr 21, 2026
            </Text>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  ),
};
