import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Joyride } from "react-joyride";
import { describe, expect, it } from "vitest";

import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";

describe("WelcomeTourTooltip", () => {
  it("focuses Next first and cycles through Back and Skip", async () => {
    const user = userEvent.setup();

    render(
      <Joyride
        run
        continuous
        stepIndex={1}
        steps={[
          { target: "body", content: "First step" },
          { target: "body", content: "Current step" },
          { target: "body", content: "Last step" },
        ]}
        options={{ buttons: ["back", "primary", "skip"], skipBeacon: true }}
        tooltipComponent={WelcomeTourTooltip}
      />,
    );

    const nextButton = await screen.findByRole("button", { name: "Next" });
    const backButton = screen.getByRole("button", { name: "Back" });
    const skipButton = screen.getByRole("button", { name: "Skip" });

    await waitFor(() => expect(nextButton).toHaveFocus());

    await user.tab();
    expect(backButton).toHaveFocus();

    await user.tab();
    expect(skipButton).toHaveFocus();

    await user.tab();
    expect(nextButton).toHaveFocus();
  });
});
