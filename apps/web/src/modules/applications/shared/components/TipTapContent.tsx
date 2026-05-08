"use client";

import { captureSync } from "@job-tracker/async";
import { cn } from "@job-tracker/ui";
import StarterKit from "@tiptap/starter-kit";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import React from "react";

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
    "[&_h1]:my-2 [&_h1]:text-lg/tight [&_h1]:font-semibold ",
    "[&_h2]:my-2 [&_h2]:text-lg/tight [&_h2]:font-medium ",
    "[&_h3]:my-2 [&_h3]:text-lg/tight [&_h3]:font-normal ",
  ),
  link: cn("[&_a]:text-text-brand [&_a]:underline"),
};

export function TipTapContent({ content, className }: TipTapContentProps) {
  if (!content) return null;

  let rendered: React.ReactNode;
  let isError = false;

  const [renderErr, node] = captureSync(() => {
    const doc = parseTipTapDocument(content);
    return renderToReactElement({
      extensions: RENDER_EXTENSIONS,
      content: doc,
    });
  });
  if (renderErr) {
    rendered = tipTapToPlainText(content);
    isError = true;
  } else {
    rendered = node;
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
