"use client";

import { tryRun } from "@job-tracker/try-run";
import { FilePdfIcon } from "@phosphor-icons/react";
import type { Editor } from "@tiptap/react";

import { getApiBaseUrl } from "@/lib/api-endpoints";
import { ToolbarButton } from "@/modules/applications/details/components/ToolbarButton";

interface SaveAsPdfButtonProps {
  editor: Editor;
  disabled?: boolean;
}

export function SaveAsPdfButton({
  editor,
  disabled = false,
}: SaveAsPdfButtonProps) {
  async function handleExportPdf() {
    const [error] = await tryRun(
      (async () => {
        const plainDocumentText = editor.getText().trim();
        const htmlContent = editor.getHTML();

        if (!plainDocumentText) {
          return;
        }

        const response = await fetch(`${getApiBaseUrl()}/pdf/export`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: htmlContent }),
        });

        if (!response.ok) {
          throw new Error(`PDF export failed: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = "export.pdf";
        a.click();
        URL.revokeObjectURL(url);
      })(),
    );
    if (error) {
      console.error("Failed to export PDF", error);
    }
  }

  return (
    <ToolbarButton
      label={<FilePdfIcon size={14} weight="bold" />}
      ariaLabel="Save as PDF"
      onClick={() => void handleExportPdf()}
      disabled={disabled}
    />
  );
}
