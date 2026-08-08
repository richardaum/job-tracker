# Welcome Tour

This module implements the welcome-tour-specific cross-route flow with separate `react-joyride` instances. `welcomeTourSteps.tsx` is the single source of truth for step content, ordering, and global numbering. Generic tour state, session persistence, and Joyride orchestration live in the sibling `modules/tour/` module.

## State and actions

- Let Joyride manage movement between steps in the current instance.
- Route-local tour components receive callbacks for external effects; they must not receive route URLs or own navigation.
- `JoyrideSegmentedTour` completes the current segment automatically on `TOUR_END`. Components must not set phases, dispatch transition events, or manipulate step identifiers directly.
- Trigger UI effects through explicit callbacks passed to the tour component. For example, `WelcomeTourJobDetails` receives `onUpdateStatus` and calls it from the `update-status-button` step's `after` callback.
- When a callback should run only after advancing, guard it with `action === ACTIONS.NEXT`. This preserves Back navigation and prevents a final-step callback from ending the tour on Back.
- Do not complete a tour explicitly from a named step. `JoyrideSegmentedTour` detects when a route-local segment ends on the global final step and calls `completeTour` automatically.

## Adding a guided interaction

1. Add the step ID, content, and order in `welcomeTourSteps.tsx`.
2. Add a stable `data-welcome-tour-step` target to the UI component being highlighted.
3. Pass an explicit callback through the owning component hierarchy if the tour must open, close, or otherwise control another UI component.
4. Update tests that assert the global step count or tour sequence.
