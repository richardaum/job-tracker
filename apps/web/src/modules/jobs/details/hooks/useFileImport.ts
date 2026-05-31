"use client";

import {
  normalizeTipTapDocument,
  parseTipTapDocument,
  tipTapToPlainText,
} from "@job-tracker/tiptap";
import { useCallback, useRef, useState } from "react";
import type { ChangeEvent } from "react";

interface UseFileImportOptions {
  editor: import("@tiptap/core").Editor | null;
  onChange: (nextValue: string) => void;
}

export function useFileImport({ editor, onChange }: UseFileImportOptions) {
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!editor) return;

      setIsImporting(true);
      try {
        let text: string;

        if (file.type === "job/pdf" || file.name.endsWith(".pdf")) {
          const arrayBuffer = await file.arrayBuffer();
          const pdfjs = await import("pdfjs-dist");
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          const textParts: string[] = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
              .map((item) => ("str" in item ? (item.str ?? "") : ""))
              .join(" ");
            textParts.push(pageText);
          }
          text = textParts.join("\n\n");
          const normalizedValue = normalizeTipTapDocument(text);
          editor.commands.setContent(parseTipTapDocument(normalizedValue), {
            emitUpdate: false,
          });
          onChange(normalizedValue);
        } else if (file.name.endsWith(".html") || file.type === "text/html") {
          const html = await file.text();
          editor.commands.setContent(html, { emitUpdate: false });
          onChange(JSON.stringify(editor.getJSON()));
        } else if (file.name.endsWith(".md") || file.type === "text/markdown") {
          const md = await file.text();
          const { marked } = await import("marked");
          const html = await marked.parse(md);
          editor.commands.setContent(html, { emitUpdate: false });
          onChange(JSON.stringify(editor.getJSON()));
        } else {
          text = await file.text();
          const normalizedValue = normalizeTipTapDocument(text);
          editor.commands.setContent(parseTipTapDocument(normalizedValue), {
            emitUpdate: false,
          });
          onChange(normalizedValue);
        }
      } catch (err) {
        console.error("Failed to import file:", err);
      } finally {
        setIsImporting(false);
      }

      event.target.value = "";
    },
    [editor, onChange],
  );

  const handleImportClick = useCallback(() => {
    if (!editor) return;
    const currentContent = tipTapToPlainText(
      JSON.stringify(editor.getJSON()),
    ).trim();
    if (currentContent) {
      setShowImportConfirm(true);
    } else {
      fileInputRef.current?.click();
    }
  }, [editor]);

  const handleConfirmImport = useCallback(() => {
    setShowImportConfirm(false);
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    isImporting,
    showImportConfirm,
    setShowImportConfirm,
    handleImportFile,
    handleImportClick,
    handleConfirmImport,
  };
}
