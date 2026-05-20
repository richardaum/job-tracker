import { Fragment, Slice } from "@tiptap/pm/model";
import { type Editor } from "@tiptap/react";

export function isInHeading(editor: Editor | null): boolean {
  if (!editor) return false;
  return (
    editor.isActive("heading", { level: 1 }) ||
    editor.isActive("heading", { level: 2 }) ||
    editor.isActive("heading", { level: 3 })
  );
}

const headingTypes = new Set(["heading", "h1", "h2", "h3"]);

export function transformPastedHeadingBold(
  slice: Slice,
  editor: Editor | null,
): Slice {
  const cursorInHeading = isInHeading(editor);
  const boldMark = editor?.state.schema.marks.bold;
  if (!boldMark) return slice;

  let modified = false;

  function stripBoldInHeadingScope(
    fragment: Fragment,
    insideHeading = false,
  ): Fragment {
    const nodes: import("@tiptap/pm/model").Node[] = [];
    fragment.forEach((node) => {
      const nodeIsHeading = headingTypes.has(node.type.name);

      if (node.isText && node.marks.length > 0) {
        if (insideHeading || cursorInHeading) {
          const filtered = node.marks.filter((m) => m.type !== boldMark);
          if (filtered.length !== node.marks.length) modified = true;
          nodes.push(node.mark(filtered));
        } else {
          nodes.push(node);
        }
      } else if (node.content.size > 0) {
        nodes.push(
          node.copy(
            stripBoldInHeadingScope(
              node.content,
              insideHeading || nodeIsHeading,
            ),
          ),
        );
      } else {
        nodes.push(node);
      }
    });
    return Fragment.fromArray(nodes);
  }

  const transformed = stripBoldInHeadingScope(slice.content, false);
  if (!modified) return slice;

  return new Slice(transformed, slice.openStart, slice.openEnd);
}
