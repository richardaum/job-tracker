import { beforeEach, describe, expect, it, vi } from "vitest";

import { EXTENSION_CHANNEL_EVENT_IMPORT_RUN_CREATED } from "../extension-channel/constants";

const mocks = vi.hoisted(() => ({
  extensionGraphqlRequest: vi.fn(),
  openImportRunTabOnce: vi.fn().mockResolvedValue(undefined),
  buildApiCookieHeader: vi.fn(
    (): Promise<string | undefined> => Promise.resolve("access_token=fake"),
  ),
  tryRefreshApiAccessToken: vi.fn(
    (): Promise<boolean> => Promise.resolve(false),
  ),
}));

vi.mock("../extension-channel/auth-cookies", (): object => ({
  buildApiCookieHeader: mocks.buildApiCookieHeader,
  tryRefreshApiAccessToken: mocks.tryRefreshApiAccessToken,
}));

vi.mock("./extension-graphql-fetch", (): object => ({
  extensionGraphqlRequest: mocks.extensionGraphqlRequest,
}));

vi.mock("./open-import-run-tab.ts", (): object => ({
  openImportRunTabOnce: mocks.openImportRunTabOnce,
}));

import { ImportRunOrchestrator } from "./import-run-orchestrator";

const updateOk = (status: string): object => ({
  data: { updateImportRunStatus: { id: "ignored", status } },
});

describe("ImportRunOrchestrator integration (Chrome / network mocked)", () => {
  beforeEach(() => {
    mocks.extensionGraphqlRequest.mockReset();
    mocks.openImportRunTabOnce.mockClear();
    mocks.buildApiCookieHeader.mockImplementation(() =>
      Promise.resolve("access_token=fake"),
    );
    mocks.tryRefreshApiAccessToken.mockImplementation(() =>
      Promise.resolve(false),
    );
  });

  it("pull: syncRunsFromPull loads RUNNING from API, drains IN_PROGRESS → tab → COMPLETED", async () => {
    mocks.extensionGraphqlRequest
      .mockResolvedValueOnce({
        data: {
          importRuns: [
            {
              id: "run-pull",
              entryUrl: "https://boards.example/import",
              status: "RUNNING",
            },
          ],
        },
      })
      .mockResolvedValueOnce(updateOk("IN_PROGRESS"))
      .mockResolvedValueOnce(updateOk("COMPLETED"));

    const sut = new ImportRunOrchestrator();

    await sut.syncRunsFromPull();

    await vi.waitUntil(
      () => mocks.openImportRunTabOnce.mock.calls.length === 1,
      { timeout: 3000 },
    );

    expect(mocks.extensionGraphqlRequest).toHaveBeenCalledTimes(3);
    const firstBody = mocks.extensionGraphqlRequest.mock.calls[0]!.at(1) as {
      query: string;
    };
    expect(firstBody.query.replace(/\s+/g, " ")).toMatch(/\bimportRuns\b/);

    expect(
      mocks.extensionGraphqlRequest.mock.calls[1]!.at(1) as {
        variables: Record<string, string>;
      },
    ).toMatchObject({ variables: { id: "run-pull", status: "IN_PROGRESS" } });

    expect(mocks.openImportRunTabOnce).toHaveBeenCalledWith(
      "run-pull",
      "https://boards.example/import",
    );

    expect(
      mocks.extensionGraphqlRequest.mock.calls[2]!.at(1) as {
        variables: Record<string, string>;
      },
    ).toMatchObject({ variables: { id: "run-pull", status: "COMPLETED" } });
  });

  it("SSE: enqueueFromGraphql only enqueues IMPORT_RUN_CREATED — no pull query; same drain mutations + tab", async () => {
    mocks.extensionGraphqlRequest
      .mockResolvedValueOnce(updateOk("IN_PROGRESS"))
      .mockResolvedValueOnce(updateOk("COMPLETED"));

    const sut = new ImportRunOrchestrator();

    sut.enqueueFromGraphql(
      EXTENSION_CHANNEL_EVENT_IMPORT_RUN_CREATED,
      JSON.stringify({
        importRunId: "run-sse",
        entryUrl: "https://live.example/start",
      }),
    );

    await vi.waitUntil(
      () => mocks.openImportRunTabOnce.mock.calls.length === 1,
      { timeout: 3000 },
    );

    expect(mocks.extensionGraphqlRequest).toHaveBeenCalledTimes(2);
    for (const call of mocks.extensionGraphqlRequest.mock.calls) {
      const q = String((call[1] as { query: string }).query).replace(
        /\s+/g,
        " ",
      );
      expect(q).toContain("mutation");
      expect(q).not.toContain("importRuns");
    }

    expect(
      mocks.extensionGraphqlRequest.mock.calls[0]!.at(1) as {
        variables: Record<string, string>;
      },
    ).toMatchObject({ variables: { id: "run-sse", status: "IN_PROGRESS" } });
    expect(mocks.openImportRunTabOnce).toHaveBeenCalledWith(
      "run-sse",
      "https://live.example/start",
    );
    expect(
      mocks.extensionGraphqlRequest.mock.calls[1]!.at(1) as {
        variables: Record<string, string>;
      },
    ).toMatchObject({ variables: { id: "run-sse", status: "COMPLETED" } });
  });
});
