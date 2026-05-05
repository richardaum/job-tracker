"use client";

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
  async function handleExportPdf() {
    const plainDocumentText = editor.getText().trim();
    const htmlContent = editor.getHTML();

    if (!plainDocumentText) {
      return;
    }

    const dateSuffix = new Date().toISOString().slice(0, 10);
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      return;
    }

    const { document: printDocument } = printWindow;
    printDocument.title = `application-notes-${dateSuffix}`;
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
    printWindow.print();
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
