"use client";

import { tryRun } from "@job-tracker/try-run";
import { FilePdfIcon } from "@phosphor-icons/react";
import type { Editor } from "@tiptap/react";
import type { Content } from "pdfmake";
import pdfMake from "pdfmake/build/pdfmake";
// @ts-expect-error — standard-fonts ships JS-only, no TS declarations
import helveticaFonts from "pdfmake/build/standard-fonts/Helvetica";

import { htmlToPdfContent } from "@/lib/html-to-pdf-content";
import {
  defaultGetFileName,
  type PdfExportConfig,
} from "@/lib/pdf-export-config";
import { ToolbarButton } from "@/modules/applications/details/components/ToolbarButton";

pdfMake.addFontContainer(helveticaFonts);

interface SaveAsPdfButtonProps {
  editor: Editor;
  disabled?: boolean;
  pdfExportConfig?: PdfExportConfig;
}

export function SaveAsPdfButton({
  editor,
  disabled = false,
  pdfExportConfig,
}: SaveAsPdfButtonProps) {
  async function handleExportPdf() {
    const [error] = await tryRun(
      (async () => {
        if (!editor.getText().trim()) return;

        const content = htmlToPdfContent(editor.getHTML()) as Content[];

        if (content.length === 0) return;

        pdfMake
          .createPdf({
            content,
            defaultStyle: {
              font: "Helvetica",
              fontSize: 10,
              lineHeight: 1.4,
              color: "#111",
            },
            styles: {
              h1: { fontSize: 18, bold: true, margin: [0, 0, 0, 2] },
              h2: {
                fontSize: 11,
                bold: true,
                margin: [10, 0, 4, 0],
                color: "#111",
              },
              h3: { fontSize: 10, bold: true, margin: [8, 0, 2, 0] },
            },
            pageSize: "A4",
            pageMargins: [14, 14, 14, 14],
          })
          .download(
            (pdfExportConfig?.getFileName ?? defaultGetFileName)(new Date()),
          );
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
