/* ============================================================
 *  MOCK DATA — Remove this file when T-176 (GraphQL resume CRUD)
 *  is complete and replace with a real ViewModel hook using
 *  generated hooks from @/gql/hooks.
 *
 *  Search for "MOCK DATA" across the resumes module to find
 *  every place that needs to be unwired.
 * ============================================================ */

import { useMemo, useState } from "react";

/* MOCK DATA: replace with Resume type from @/gql/hooks */
export interface MockResume {
  id: string;
  title: string;
  content: string; /* TipTap JSON string */
  preferences: Array<{ text: string; weight: "high" | "low" }>;
  createdAt: string;
  updatedAt: string;
}

/* MOCK DATA: replace with generated Apollo query hook + loading/error
   logic from e.g. useResumesListViewModel() */
export function useMockResumes() {
  const [showInitialLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  const resumes = useMemo<MockResume[]>(
    () => [
      {
        id: "mock-001",
        title: "Senior Full-Stack Engineer",
        content: JSON.stringify({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Full-stack engineer with 8+ years building web applications using React, Node.js, and TypeScript. Led cross-functional teams delivering SaaS products at scale. Experienced with GraphQL APIs, PostgreSQL, and cloud infrastructure on AWS.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Recent role: Senior Engineer at TechCorp — built a real-time analytics dashboard serving 50k+ daily active users. Migrated legacy REST APIs to GraphQL, reducing frontend data-fetching complexity by 60%.",
                },
              ],
            },
          ],
        }),
        preferences: [
          { text: "Remote-first company", weight: "high" },
          { text: "Equity compensation", weight: "low" },
          { text: "No on-call rotation", weight: "high" },
        ],
        createdAt: "2026-04-28T10:30:00Z",
        updatedAt: "2026-05-05T14:22:00Z",
      },
      {
        id: "mock-002",
        title: "Frontend-Focused (React)",
        content: JSON.stringify({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Frontend engineer specializing in React, Next.js, and Tailwind CSS. 5 years of experience building accessible, performant user interfaces. Strong design system thinking and component library architecture.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Built and maintained a company-wide design system used by 12 product teams. Passionate about web performance, Core Web Vitals, and developer experience.",
                },
              ],
            },
          ],
        }),
        preferences: [
          { text: "Product-led company", weight: "high" },
          { text: "Design-centric culture", weight: "low" },
        ],
        createdAt: "2026-05-01T09:15:00Z",
        updatedAt: "2026-05-03T16:45:00Z",
      },
      {
        id: "mock-003",
        title: "Backend / Infrastructure",
        content: JSON.stringify({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Backend engineer with strong infrastructure and DevOps background. Proficient in Go, Rust, and TypeScript. Designed distributed systems handling millions of events per day.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Architected a event-driven microservices platform on Kubernetes. Implemented CI/CD pipelines reducing deployment time from 45min to 8min.",
                },
              ],
            },
          ],
        }),
        preferences: [
          { text: "Platform/infra team", weight: "high" },
          { text: "Remote", weight: "high" },
          { text: "Open-source friendly", weight: "low" },
        ],
        createdAt: "2026-05-02T11:00:00Z",
        updatedAt: "2026-05-02T11:00:00Z",
      },
    ],
    [],
  );

  return { resumes, error, showInitialLoading };
}

/* MOCK DATA: replace with useResumeQuery(id) or similar ViewModel
   when T-176 is complete. */
export function useMockResume(id: string) {
  const { resumes } = useMockResumes();

  return useMemo(() => {
    const resume = resumes.find((r) => r.id === id) ?? null;
    const loading = false;
    const error: Error | null = null;
    const notFound = resume === null;

    return { resume, loading, error, notFound, showInitialLoading: false };
  }, [id, resumes]);
}
