# Roadmap

**Current Milestone:** M2 - Rich Tracking
**Status:** In Progress

---

## M1 - Foundation

**Goal:** Functional app with authentication and basic application CRUD
**Target:** Feature completeness (no fixed deadline)

### Features

**Project Setup** - DONE

- Initialize pnpm workspaces monorepo (Web + API + Extension + packages/ui)
- Initialize Next.js 15 (Web) and NestJS (API) as separate services
- Set up Design System package (packages/ui) with Tailwind CSS, Radix UI, Storybook and Vitest
- Set up local PostgreSQL and Drizzle
- Configure GitHub Actions CI/CD pipeline
- Configure Docker for NestJS production deployment
- Configure Sentry on all services

**Google OAuth** - DONE

- Login and logout with Google account
- Persistent session per user
- Protected authenticated routes
- GraphQL Codegen baseline in Web with `me` query using generated hook (`useMeQuery`)

**Visual Identity** - DONE

- Define color palette, typography, and spacing tokens
- Configure Tailwind CSS theme (design tokens)
- Establish mobile-first breakpoints
- Light/dark mode support

**Application CRUD** - DONE

- Create application with title, company, URL, and date
- List applications for the authenticated user
- Edit and delete application

---

## M2 - Rich Tracking

**Goal:** Detailed tracking of each application with stages and notes

### Features

**Stages** - PLANNED

- Define application stages (Applied, Phone Screen, Technical, Offer, Rejected, etc.)
- Stage change history with timestamps

**Notes** - PLANNED

- Add free-form notes per application
- Post-interview feedback field

**Dashboard Overview** - PLANNED

- Overview of all applications by stage
- Filters and search

**Platform Reliability Hardening (TLC)** - PLANNED

- Start TLC flow on `.specs/tech/platform-reliability-hardening/spec.md` (`Specify -> Design -> Tasks -> Execute`)
- Instrument query-per-request monitoring with warning threshold (>15 queries)
- Cover concurrency, memory leak prevention, profiling, supply chain security, architecture decisions, and failure simulations

**Multi-language Support** - PLANNED

- i18n setup with locale detection
- English and Portuguese (BR) as initial languages
- All UI strings externalized

---

## M3 - AI Features

**Goal:** Smart insights to increase application success rate and reduce manual effort

### Features

**AI-powered Insights** - PLANNED

- Real-time job summary
- Candidate vs. job fit assessment
- Skills gap analysis
- Interview preparation tips

**AI Note Structuring** - PLANNED

- User types raw notes after an interview
- AI restructures and enriches the note using job description and candidate resume as context
- Output is a clean, organized note saved back to the application

**Goal:** Smart insights to increase application success rate

### Features

**AI-powered Insights** - PLANNED

- Real-time job summary
- Candidate vs. job fit assessment
- Skills gap analysis
- Interview preparation tips

---

## Future Considerations

- Chrome extension to import applications from job boards (LinkedIn, Jack, RemoteYeah)
- Automatic job import from generic job boards
- Guided auto-apply
- Guest onboarding: try before you sign up
