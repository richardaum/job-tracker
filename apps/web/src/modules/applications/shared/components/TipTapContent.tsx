"use client";

import React from "react";
import StarterKit from "@tiptap/starter-kit";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { cn } from "@job-tracker/ui";
import {
  parseTipTapDocument,
  tipTapToPlainText,
} from "@/modules/applications/shared/utils/tiptap";

const RENDER_EXTENSIONS = [StarterKit];

interface TipTapContentProps {
  content: string | null | undefined;
  className?: string;
}

export function TipTapContent({ content, className }: TipTapContentProps) {
  if (!content) return null;

  let rendered: React.ReactNode;
  let isError = false;

  try {
    const doc = parseTipTapDocument(content);
    rendered = renderToReactElement({
      extensions: RENDER_EXTENSIONS,
      content: doc,
    });
  } catch {
    rendered = tipTapToPlainText(content);
    isError = true;
  }

  if (isError) {
    return (
      <div
        className={cn("text-sm whitespace-pre-wrap wrap-break-word", className)}
      >
        {rendered}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "text-sm whitespace-pre-wrap wrap-break-word [&_p]:m-0 [&_p+p]:mt-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-text-brand [&_a]:underline",
        className,
      )}
    >
      {rendered}
    </div>
  );
}
