import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { Timeline, TimelineContent, TimelineItem, TimelineMarker } from "./Timeline";

describe("Timeline", () => {
  it("renders items and marker connectors", () => {
    render(
      <Timeline>
        <TimelineItem>
          <TimelineMarker showBottomConnector />
          <TimelineContent>First</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineMarker showTopConnector />
          <TimelineContent>Second</TimelineContent>
        </TimelineItem>
      </Timeline>,
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getAllByRole("presentation")).toHaveLength(2);
  });
});
