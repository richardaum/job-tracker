# Match Improvement — Task List

**Feature slug:** `match-improvement`
**PRD:** `../match-details-as-tab/_prd.md`
**TechSpec:** `../match-details-as-tab/_techspec.md`

## Dependency Graph

```
T-01 (Remove old entry points + update link)
  └── T-02 (Create MatchTabContent component)
        └── T-03 (Wire tab into JobDetailsPage + create route)
              └── T-04 (Redirect + delete standalone routes)
                    └── T-05 (Final cleanup and verification)
```

## Tasks

| #    | Title                                             | Status    | Complexity | Dependencies |
| ---- | ------------------------------------------------- | --------- | ---------- | ------------ |
| T-01 | Remove old match entry points and update link     | completed | medium     | —            |
| T-02 | Create MatchTabContent component                  | completed | high       | T-01         |
| T-03 | Wire Match tab into JobDetailsPage + create route | completed | medium     | T-02         |
| T-04 | Add redirect + delete standalone match routes     | completed | medium     | T-03         |
| T-05 | Final cleanup and verification                    | completed | low        | T-04         |
