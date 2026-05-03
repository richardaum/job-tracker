import type { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ImportRunStatus } from "@/gql/graphql";
import {
  ClearImportRunsDocument,
  CreateImportRunDocument,
  DeleteImportRunDocument,
  ImportRunsDocument,
} from "@/gql/hooks";

import ImportsPage from "./ImportsPage";

const REMOTEYEAH_ENTRY =
  "https://remoteyeah.com/remote-frontend-engineer+reactjs-jobs-in-brazil+latin-america+worldwide#jobs";

const createdRun = {
  __typename: "ImportRunType" as const,
  id: "run-1",
  importerId: "remoteyeah",
  importerName: "RemoteYeah",
  entryUrl: REMOTEYEAH_ENTRY,
  status: ImportRunStatus.Running,
  startedAt: "2026-05-02T12:00:00.000Z",
  importerSource: "database",
};

function renderImportsPage(mocks: ReadonlyArray<MockLink.MockedResponse>) {
  return render(
    <MockedProvider mocks={mocks}>
      <ImportsPage />
    </MockedProvider>,
  );
}

describe("ImportsPage", () => {
  it("renders heading and New run control", () => {
    renderImportsPage([
      {
        request: { query: ImportRunsDocument },
        result: { data: { importRuns: [] } },
      },
    ]);
    expect(
      screen.getByRole("heading", { name: /^Imports$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /new run/i }).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("adds a run when starting from built-in RemoteYeah importer", async () => {
    const user = userEvent.setup();
    renderImportsPage([
      {
        request: { query: ImportRunsDocument },
        result: { data: { importRuns: [] } },
      },
      {
        request: {
          query: CreateImportRunDocument,
          variables: { input: { importerId: "remoteyeah" } },
        },
        result: { data: { createImportRun: createdRun } },
      },
      {
        request: { query: ImportRunsDocument },
        result: { data: { importRuns: [createdRun] } },
      },
    ]);

    await screen.findByText(/no import runs yet/i);

    await user.click(screen.getAllByRole("button", { name: /new run/i })[0]);
    const combo = screen.getByPlaceholderText(/choose importer/i);
    await user.click(combo);
    await user.type(combo, "RemoteYeah");
    await user.click(screen.getByRole("menuitem", { name: /^RemoteYeah$/ }));
    await user.click(screen.getByRole("button", { name: /^Start$/i }));

    expect(
      (await screen.findAllByText("RemoteYeah")).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/^Importer$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^running$/i).length).toBeGreaterThanOrEqual(1);
  });

  it("clears all runs after confirming clear imports", async () => {
    const user = userEvent.setup();
    renderImportsPage([
      {
        request: { query: ImportRunsDocument },
        result: { data: { importRuns: [createdRun] } },
      },
      {
        request: { query: ClearImportRunsDocument },
        result: { data: { clearImportRuns: true } },
      },
      {
        request: { query: ImportRunsDocument },
        result: { data: { importRuns: [] } },
      },
    ]);

    await screen.findByRole("button", { name: /RemoteYeah/i });
    await user.click(screen.getByRole("button", { name: /clear imports/i }));
    await user.click(screen.getByRole("button", { name: /^Clear all$/i }));

    expect(await screen.findByText(/no import runs yet/i)).toBeInTheDocument();
  });

  it("removes a run after confirming delete", async () => {
    const user = userEvent.setup();
    renderImportsPage([
      {
        request: { query: ImportRunsDocument },
        result: { data: { importRuns: [createdRun] } },
      },
      {
        request: { query: DeleteImportRunDocument, variables: { id: "run-1" } },
        result: { data: { deleteImportRun: true } },
      },
      {
        request: { query: ImportRunsDocument },
        result: { data: { importRuns: [] } },
      },
    ]);

    await user.click(
      await screen.findByRole("button", { name: /RemoteYeah/i }),
    );
    await user.click(screen.getByRole("button", { name: /remove run/i }));
    await user.click(screen.getByRole("button", { name: /^Remove$/ }));

    expect(await screen.findByText(/no import runs yet/i)).toBeInTheDocument();
  });
});
