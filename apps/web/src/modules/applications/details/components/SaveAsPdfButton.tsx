"use client";

import { tryRun } from "@job-tracker/try-run";
import { FilePdfIcon } from "@phosphor-icons/react";
import type { Editor } from "@tiptap/react";

import { ToolbarButton } from "@/modules/applications/details/components/ToolbarButton";

interface SaveAsPdfButtonProps {
  editor: Editor;
  disabled?: boolean;
}

export function SaveAsPdfButton({
  editor,
  disabled = false,
}: SaveAsPdfButtonProps) {
  function getExportFileName() {
    const dateSuffix = new Date().toISOString().slice(0, 10);
    const pageTitle = window.document.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!pageTitle) {
      return `document-export-${dateSuffix}`;
    }

    return `${pageTitle}-${dateSuffix}`;
  }

  async function handleExportPdf() {
    const [error] = await tryRun(
      (async () => {
        const plainDocumentText = editor.getText().trim();
        const htmlContent = editor.getHTML();

        if (!plainDocumentText) {
          return;
        }

        const exportFileName = getExportFileName();
        const printWindow = window.open("about:blank", "_blank");
        if (!printWindow) {
          return;
        }
        printWindow.opener = null;

        const { document: printDocument } = printWindow;
        let hasTriggeredPrint = false;
        let hasClosedWindow = false;
        const closePrintWindow = (source: string) => {
          if (hasClosedWindow) {
            return;
          }
          hasClosedWindow = true;
          void source;
          printWindow.close();
        };

        const printMediaQuery = printWindow.matchMedia("print");
        printWindow.addEventListener("afterprint", () => {
          closePrintWindow("afterprint");
        });
        printMediaQuery.addEventListener("change", (event) => {
          if (hasTriggeredPrint && !event.matches) {
            closePrintWindow("matchMedia-change-false");
          }
        });
        printDocument.title = exportFileName;
        const style = printDocument.createElement("style");
        style.textContent = `
      body {
        margin: 32px;
        font-family: Inter, Arial, sans-serif;
        font-size: 12pt;
        line-height: 1.5;
        white-space: pre-wrap;
        overflow-wrap: break-word;
      }
    `;
        printDocument.head.appendChild(style);
        printDocument.body.innerHTML = htmlContent;
        printWindow.focus();
        hasTriggeredPrint = true;
        printWindow.print();
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
