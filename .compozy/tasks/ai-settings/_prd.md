# PRD: AI Settings — Per-User OpenAI Key and AI Toggle

**Status**: planned · **Priority**: high · **Created**: 2026-07-30

## Overview

Every AI-powered capability in the app (job summaries, AI chat, auto-fill, match analysis, note generation, company descriptions, location inference, text rewriting) runs on a single OpenAI API key configured as a server environment variable. The operator bears all AI cost and liability for every user's usage, and no user has any control over whether AI touches their account.

This feature moves ownership of the OpenAI key to each user. New users get a limited trial quota of AI usage on the shared key; once that quota is used up, AI features stop working until the user supplies their own key in Profile Settings. Independently of the key, every user gets an explicit AI on/off control so they can turn AI capabilities off entirely, for as long as they want, regardless of whether a key or trial quota is available. Content already produced by AI before being turned off (summaries, chat history, match results, notes) stays visible and readable — only the ability to trigger new AI activity is affected.

## Goals

- **Shift AI cost ownership to the user**: after a bounded trial, users pay OpenAI directly through their own key instead of the app's shared key absorbing indefinite usage.
- **Give users explicit control over AI**: a single, discoverable toggle lets a user disable all live AI activity on their account at any time, independent of key/quota state.
- **Preserve access to prior AI output**: disabling AI (by toggle, missing key, or exhausted quota) never hides or blocks previously generated summaries, chat history, match results, or notes.
- **Guide users to resolution, not dead ends**: when an AI action is blocked, the user is told why and routed directly to the place that fixes it (Settings).

## User Stories

- As a new user, I get to try AI features (summary, chat, auto-fill, etc.) without configuring anything, up to a usage quota, so I can evaluate the product before committing to my own key.
- As a user whose trial quota is used up, when I try an AI action, I'm told my trial is over and taken straight to where I can add my own OpenAI key, so I know exactly what to do next.
- As a user, I add my OpenAI key in Profile Settings and get immediate confirmation that it works (or a clear error if it doesn't), so I'm not left guessing.
- As a privacy-conscious user, I turn AI off entirely from my Settings, independent of whether I have a key or trial quota left, so the app stops making any live AI calls on my account.
- As a user who turned AI off, I can still read summaries, chat history, match results, and notes that were already generated, so I don't lose access to information I already have.
- As a user who clicks an AI action while AI is off (by my own toggle, missing key, or exhausted trial), I see a modal explaining why and offering a direct path to Settings, so I'm never stuck wondering why nothing happened.

## Core Features

1. **Per-user OpenAI key field** — A new field in the existing Profile Settings tab where a user enters their own OpenAI API key. Saved only after the key is validated against OpenAI; an invalid key is rejected immediately with a clear error and not saved. The key is stored securely and never displayed back in full once saved (e.g., masked, with the option to replace or remove it). Once saved, a lock icon sits next to the field with a tooltip confirming the key is stored encrypted and used only for that user's own AI requests, so the user has explicit reassurance about how their secret is handled.

2. **Usage-based trial quota** — Users without a personal key can use AI features on the shared/system key up to 50 AI calls, tracked per user. Once the quota is reached, AI actions stop succeeding on the shared key; the user must add their own key to continue. This applies uniformly to new signups and to all existing users as of launch — everyone starts the 50-call trial from zero when the feature ships, regardless of prior usage under the old shared-key model.

3. **Independent AI on/off toggle** — A separate control in Profile Settings, alongside the key field, that lets a user disable all live AI activity on their account regardless of key or quota state. The toggle reflects only the user's explicit choice: removing a key or running out of trial quota never changes the toggle's position, and flipping the toggle never adds or removes a key. AI is available only when both conditions hold: the toggle is on, AND the user has either a configured key or remaining trial quota.

4. **Consistent AI-blocked experience** — Wherever a user triggers a live AI action (chat, summary generation, auto-fill, match analysis, note generation, company description, location inference, rewrite/restructure) while AI is unavailable, the entry point stays visible and clickable. Clicking opens a modal explaining the specific reason: if the toggle is off, the modal names that; if the toggle is on but there's no key and no trial quota left, the modal names that instead. Either way, the modal links directly to the relevant Settings control.

5. **Unaffected read access to prior AI output** — Summaries, AI chat history, match analysis results, and AI-generated notes already saved remain fully visible and readable at all times, independent of the toggle, key, or quota state. Only the generation of new AI content is gated.

6. **Sidebar trial usage indicator** — While a user is on the shared-key trial (no personal key configured yet), the sidebar shows a trackbar reflecting remaining trial quota, so usage is visible before the user hits the limit. The trackbar disappears entirely once the user configures their own OpenAI key, since trial quota no longer applies.

## User Experience

- **Entry point**: Profile Settings tab (`/profile/settings`), where the OpenAI key field and the AI on/off toggle sit alongside the existing duplicate-detection window, auto-fill, auto-summary, and auto-match controls.
- **Adding a key**: User pastes their OpenAI key into the field and saves. The system validates it immediately; success confirms and masks the key, failure shows an inline error and the key is not persisted. Once saved, a lock icon with a tooltip ("Your key is stored encrypted and used only for your own AI requests") appears next to the field.
- **Trial in progress**: The sidebar displays a trackbar showing remaining AI trial quota, updating as usage accrues, so the user has advance visibility before hitting the limit.
- **Key configured**: The sidebar trackbar disappears — trial quota tracking is no longer relevant once the user supplies their own key.
- **Trial exhausted, no key, toggle on**: Any AI action attempt opens the guidance modal: "Your AI trial is over — add your own OpenAI key to keep using AI features," with a button to Settings. The toggle itself is untouched by this state.
- **AI manually turned off**: Any AI action attempt opens the guidance modal: "AI is turned off for your account," with a button to Settings where the user can turn it back on. This takes priority in messaging when both the toggle is off and no key/quota is available, since it reflects the user's explicit choice.
- **Key removed while quota exhausted**: The user returns to the "trial exhausted, no key" state above — removing a key never flips the toggle automatically.
- **Reading prior AI content**: No change — summaries, chat threads, match results, and notes render exactly as before, with no gating or warnings, whether AI is on or off.
- **Turning AI back on**: Flipping the toggle back on (with a valid key or remaining quota) immediately restores all AI entry points to their normal, working behavior.

## Non-Goals

- Support for AI providers other than OpenAI — deferred.
- Organization- or team-level key management and billing — this app is per-user; no shared/admin key ownership model.
- Per-feature granular toggles (e.g., disabling only chat but not summaries) — the toggle is all-or-nothing for live AI activity.
- Key rotation reminders, expiration policies, or usage-cost dashboards for the user's own key — deferred.
- Rate limiting or spend caps on the user's own key once configured — the user's key is subject only to their own OpenAI account limits.
- Migrating or regenerating AI content that was produced under the old shared-key model — existing summaries, chat history, match results, and notes are unaffected and require no migration.
- An internal, team-controlled rollout flag for gradually enabling AI features across the user base (e.g., via an experimentation platform) — this PRD covers only the end-user-facing, per-account toggle; a separate operational rollout mechanism is out of scope.

## Phased Rollout Plan

**Phase 1 — MVP (this PRD):**

1. Add OpenAI key field to Profile Settings with save-time validation, masking, and replace/remove controls.
2. Implement usage-based trial quota tracked per user on the shared key.
3. Add independent AI on/off toggle to Profile Settings.
4. Apply consistent modal gating (reason + link to Settings) across all AI entry points when AI is unavailable.
5. Confirm all existing AI-generated content (summaries, chat history, match results, notes) remains fully visible regardless of AI state.
6. Add sidebar trackbar showing remaining trial quota during the trial period, removed once a personal key is configured.
7. Grant all existing users (created before launch) the same 50-call trial quota from zero, starting at launch.

**Phase 2 — Future:**

- Support additional AI providers beyond OpenAI.
- Usage/cost visibility for the user's own key.
- Per-feature granular controls instead of a single global toggle.
- Internal rollout/experimentation flag for staged feature enablement, separate from the user-facing toggle.

## Success Metrics

- 100% of the 9 existing AI entry points (chat, summary, auto-fill, match analysis, notes, company description, location inference, rewrite, restructure) respect the trial quota (50 calls), key presence, and manual toggle consistently, with the toggle and key/quota state tracked and enforced independently.
- Users past their trial quota see the guidance modal instead of a silent failure or generic error, on first attempt, every time.
- Previously generated AI content (summaries, chat history, match results, notes) remains accessible with zero regressions after AI is toggled off.
- Key validation catches invalid keys at save time, measured by near-zero AI call failures attributable to a bad key that was accepted.
- The sidebar trial trackbar accurately reflects remaining quota and disappears immediately upon a user configuring their own key, with zero cases of it persisting after a key is set.

## Risks and Mitigations

| Risk                                                                                                           | Mitigation                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Users abandon the product once trial quota runs out and they must supply their own key                         | Keep the guidance modal clear and low-friction, with a direct one-click path to Settings, not a dead end                              |
| Users don't realize AI is off (via toggle) and think features are broken                                       | Modal explicitly names the reason ("AI is turned off for your account") rather than a generic error                                   |
| A single global toggle is too coarse for users who want some AI features but not others                        | Explicitly scoped as a Non-Goal for this phase; revisit granular controls in Phase 2 if requested                                     |
| The fixed 50-call trial quota turns out too low or too high once real usage data comes in                      | Ship at 50 as a starting point; make the threshold easily adjustable server-side so it can be tuned post-launch without a new release |
| Existing AI-generated content becomes inaccessible by mistake when AI is disabled                              | Explicit acceptance criteria: read paths for summaries, chat history, match results, and notes are never gated                        |
| Existing users all hit trial exhaustion around the same time after launch, causing a spike in support/friction | Monitor quota exhaustion rate post-launch; the guidance modal's direct path to Settings is the primary mitigation                     |

## Architecture Decision Records

- [ADR-001](./adrs/adr-001.md) — Single-Phase Delivery: ship key management, trial quota, manual toggle, and consistent modal gating together in one MVP rather than splitting backend enforcement and UI gating across phases.

## Open Questions

None outstanding — all questions raised during brainstorming were resolved and folded into the sections above.
