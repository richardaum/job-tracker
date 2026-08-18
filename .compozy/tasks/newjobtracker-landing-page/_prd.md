# PRD: NewJobTracker Landing Page

## Overview

NewJobTracker currently has no public-facing marketing page — visitors land directly on the Google sign-in screen with no explanation of what the product does or why it's different. This PRD defines a standalone landing page that demonstrates the product's core loop (paste a job link → AI drafts the application → track it through your pipeline → AI scores your fit → compare offers) and leads with its most distinctive trait for a technical audience: it's free, and AI features run on the user's own API key (BYOK), so there's no third-party markup and no data flowing through NewJobTracker's own AI provider.

The page's single job is to take a visitor from "what is this" to "sign in with Google" with as few unexplained claims as possible.

## Goals

- Communicate what NewJobTracker does in the time it takes to see the hero, without requiring the visitor to read a feature list first.
- Make BYOK a lead differentiator, not a footnote — position it as privacy and control, not just a cost mechanic.
- Convert directly into the existing Google OAuth sign-in flow with a single, unambiguous CTA.
- Read as built specifically for a technical, job-hunting audience — not a generic SaaS template.

## User Stories

- As a developer job-hunting and frustrated with spreadsheets, I want to see exactly how NewJobTracker organizes my search before I sign up, so I can decide in under a minute if it's worth trying.
- As a privacy-conscious technical user, I want to understand that my AI usage runs on my own API key before I connect any account, so I know my resume and job data aren't being routed through a third-party AI subscription I don't control.
- As a returning visitor who's already tried competitors (Teal, Huntr, Simplify), I want to quickly see what's different about NewJobTracker, so I don't have to re-evaluate the whole category from scratch.
- As any visitor, I want a single clear next step (sign in with Google), so I'm not stuck deciding between multiple competing CTAs.

## Core Features

### 1. Hero: the product loop as thesis

The hero demonstrates the real product flow using actual screenshots of the app UI (populated with temporary mocked data, captured for this purpose only — no real user data): paste a job link → AI drafts the application → it enters your pipeline → AI scores your fit against your resume → you compare offers. Using real screenshots instead of illustration keeps the page honest about what the product actually looks like, rather than an idealized mockup.

### 2. BYOK / privacy section

A dedicated section explaining that AI features run on the user's own API key: "your key, your data, your control." Framed around privacy and control, not cost savings. This is the page's stated differentiator against competitors that route AI usage through their own subscription.

### 3. Feature section (four existing value props)

Presents the four messages already validated in the product's own login UI, one at a time, each tied to a concrete part of the loop shown in the hero:

- "Paste a link, get a draft"
- "AI scores your fit"
- "Never miss a follow-up"
- "Compare offers instantly"

### 4. Single CTA: Sign in with Google

One call-to-action, repeated at most twice on the page (e.g., near the hero and again at the page end), leading directly into the existing Google OAuth sign-in flow. No secondary CTAs (no extension install, no waitlist, no pricing link).

## User Experience

A visitor arrives with no prior context. They see the product loop demonstrated immediately in the hero — this alone should communicate "this is a job tracker with AI that drafts applications for me." Scrolling down, they encounter the BYOK/privacy explanation before any feature list, establishing trust ahead of persuasion. The four feature messages follow, each reinforcing a stage of the loop already shown in the hero rather than introducing new unexplained claims. The page ends on the same single CTA shown at the top: sign in with Google. There is no pricing table, no testimonials (none exist yet), no extension mention, and no comparison table against named competitors.

## Non-Goals

- No pricing page or pricing section — the product is free; BYOK is not a pricing tier.
- No mention of the browser extension — it is not yet publicly installable.
- No testimonials, logos, or social proof section — none exist yet for this product.
- No waitlist or early-access flow — the product is live and sign-in is open today.
- No comparison table naming specific competitors (Teal, Huntr, Simplify).
- No multi-page marketing site (About, Blog, Careers, etc.) — this PRD covers a single landing page only.

## Phased Rollout Plan

1. **Capture reference screenshots.** Run the app locally with temporary mocked data (job listings, pipeline stages, AI fit scores, offer comparisons) and use browser automation to capture real screenshots of each stage of the product loop for use in the hero. No real user data is used or persisted for this purpose.
2. **Visual mockup (Artifact).** Build the landing page as a standalone HTML mockup using the `/frontend-design` process (token system, typography, layout concept, signature element) grounded in NewJobTracker's existing brand (cerulean/yale-blue palette, Outfit typeface, briefcase-checklist mark), the captured screenshots, and real product copy. Review with the user before any production code is touched.
3. **Production route.** Once the visual direction is approved, port the page into a real route in `apps/web` (e.g., a public marketing route), wiring the CTA into the existing Google OAuth sign-in flow and reusing design-system tokens/components where they fit.

## Success Metrics

- Visitor reaches the CTA and initiates Google sign-in (primary conversion signal — instrumentation is out of scope for this PRD but the CTA must be a single trackable action).
- Qualitative: a first-time visitor with no prior context can correctly describe what NewJobTracker does and why BYOK matters after viewing the page, without needing to ask.

## Risks and Mitigations

- **Risk:** A single free-text hero (no live product demo) fails to make the product loop feel real. **Mitigation:** ground the hero in specific, real product terms (actual pipeline stage names, actual fit-scoring language) rather than abstract marketing copy, per ADR-001.
- **Risk:** BYOK is unfamiliar terminology to some technical visitors and could confuse rather than reassure. **Mitigation:** lead with the plain-language framing ("your key, your data") before introducing the BYOK term itself.
- **Risk:** Porting from Artifact mockup to a real Next.js route introduces visual drift or breaks design-system consistency. **Mitigation:** the mockup is explicitly grounded in the existing token system (colors, type scale, spacing) from the start, per ADR-001, to minimize rework at port time.

## Architecture Decision Records

- [ADR-001: Landing page narrative structure and delivery approach](adrs/adr-001.md) — chooses a product-flow narrative hero (loop → BYOK/privacy → four features → single CTA) over a competitor-pattern or minimalist structure, and chooses an Artifact mockup-first delivery approach over building directly in `apps/web`.

## Open Questions

- Should the CTA route directly to the existing Google OAuth flow, or to an intermediate `/login` route (LoginV2) that then offers Google sign-in? (Assumed: direct to the existing sign-in flow, to be confirmed at the production-route phase.)
- Once the browser extension is publicly available, will this PRD's scope need a revision to add it as a secondary CTA or feature? (Out of scope for this version; flagged for a future update.)
