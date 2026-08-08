import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DialogControl } from "@job-tracker/ui";

import { JobQuickEditDialog } from "@/modules/jobs/list/components/JobQuickEditDialog";

vi.mock("@/gql/hooks", () => ({ useCompaniesQuery: () => ({ data: { companies: [] } }) }));

const control: DialogControl = { isOpen: true, onOpenChange: vi.fn(), open: vi.fn(), close: vi.fn(), toggle: vi.fn() };

describe("JobQuickEditDialog", () => {
  it.each([
    ["title", 0, -1, -1],
    ["company", -1, 0, -1],
    ["create", -1, -1, 0],
  ] as const)(
    "keeps only the %s target in the dialog tab order",
    (interactiveField, titleTabIndex, companyTabIndex, createTabIndex) => {
      render(
        <JobQuickEditDialog
          control={control}
          loading={false}
          dismissible={false}
          interactiveField={interactiveField}
        />,
      );

      expect(screen.getByLabelText(/Job title/)).toHaveProperty("tabIndex", titleTabIndex);
      expect(screen.getByLabelText(/Company/)).toHaveProperty("tabIndex", companyTabIndex);
      expect(screen.getByText("Cancel")).toHaveProperty("tabIndex", -1);
      expect(screen.getByText("Create")).toHaveProperty("tabIndex", createTabIndex);
    },
  );
});
