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

const tipTapContentClasses = {
  base: cn("text-sm whitespace-pre-wrap wrap-break-word"),
  paragraph: cn("[&_p]:m-0 [&_p+p]:mt-2"),
  bulletList: cn("[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"),
  orderedList: cn("[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5"),
  heading: cn(
    "[&_h1]:my-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:leading-tight",
    "[&_h2]:my-2 [&_h2]:text-lg [&_h2]:font-medium [&_h2]:leading-tight",
    "[&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-normal [&_h3]:leading-tight",
  ),
  link: cn("[&_a]:text-text-brand [&_a]:underline"),
};

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
        tipTapContentClasses.base,
        tipTapContentClasses.paragraph,
        tipTapContentClasses.bulletList,
        tipTapContentClasses.orderedList,
        tipTapContentClasses.heading,
        tipTapContentClasses.link,
        className,
      )}
    >
      {rendered}
    </div>
  );
}
