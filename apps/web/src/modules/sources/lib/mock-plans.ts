export const REMOTEYEAH_PLAN = {
  id: "8f3c2a10-4b5d-4c9e-9f1a-2d7e6c8b0a91",
  profileId: "remoteyeah",
  name: "RemoteYeah",
  steps: [
    {
      id: "step-remoteyeah-job-cards",
      action: {
        scope: "public",
        kind: "collect.jobs",
        input: {
          containerSector: ".section__content div:has(> article.job-card)",
          itemSelector: "article.job-card",
          detailsUrlField: "detailUrl",
          key: "{{company}}-{{title}}",
          parallelDetailsTabs: 10,
          pagination: {
            kind: "next-button",
            containerSelector: ".pagination",
            nextButtonPartialMatch: "Next",
          },
          surfaceFields: [
            {
              key: "title",
              selector: ".job-card-title-text",
              type: "property",
              value: "innerText",
            },
            {
              key: "company",
              selector: ".job-card-company",
              type: "property",
              value: "innerText",
            },
            {
              key: "detailUrl",
              selector: "a.job-card-title",
              type: "attribute",
              value: "href",
            },
            {
              key: "publishedAt",
              selector: "time.job-card-published",
              type: "attribute",
              value: "datetime",
            },
          ],
          detailsFields: [
            {
              key: "description",
              selector: "div.prose.dark\\:prose-invert",
              type: "property",
              value: "innerHTML",
              format: "tiptap",
            },
            {
              key: "salary",
              selector: "div.flex.flex-col.gap-2 > p.badge-success span",
              type: "property",
              value: "innerText",
              format: "salary",
            },
          ],
        },
      },
    },
  ],
};

export const TELEGRAM_PLAN = {
  id: "e2b4d89f-1c3a-4e5d-9a7f-3b6c8d0e1f2a",
  profileId: "telegram-jsgurujobs",
  name: "Telegram JSGuruJobs",
  steps: [
    {
      id: "step-telegram-messages",
      action: {
        scope: "public",
        kind: "collect.messages",
        input: {
          containerSector: "div.tg-list",
          itemSelector: "div.message",
          pagination: { kind: "scroll", scrollContainer: "div.tg-list-scroll" },
          surfaceFields: [
            {
              key: "text",
              selector: "div.message-text",
              type: "property",
              value: "innerText",
            },
            {
              key: "author",
              selector: "span.author-name",
              type: "property",
              value: "innerText",
            },
            {
              key: "timestamp",
              selector: "time.timestamp",
              type: "attribute",
              value: "datetime",
            },
          ],
        },
      },
    },
  ],
};

export const MOCK_PLANS = [REMOTEYEAH_PLAN, TELEGRAM_PLAN];

export function findMockPlanById(id: string) {
  return MOCK_PLANS.find((p) => p.id === id) ?? null;
}
