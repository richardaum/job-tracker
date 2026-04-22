# Google OAuth — Spec

**Milestone:** M1
**Status:** Done

## Requirements

| ID    | Description                                                                               |
| ----- | ----------------------------------------------------------------------------------------- |
| GO-01 | Login with Google via OAuth redirect flow                                                 |
| GO-02 | Logout terminates session and invalidates the refresh token                               |
| GO-03 | Persistent session via JWT access token (15 min) + httpOnly refresh token cookie (7 days) |
| GO-04 | `me` query returns the currently authenticated user                                       |
| GO-05 | Protected routes redirect to /login when unauthenticated                                  |
| GO-06 | Extensible RBAC with `@Roles()` guard and decorator from day one (`user` role only in v1) |
