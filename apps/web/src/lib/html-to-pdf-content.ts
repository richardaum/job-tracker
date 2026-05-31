type InlineSegment = {
  text: string;
  bold?: boolean;
  italics?: boolean;
  link?: string;
  color?: string;
  font?: string;
};

type PdfContent =
  | string
  | InlineSegment[]
  | {
      text?: unknown;
      style?: string;
      bold?: boolean;
      italics?: boolean;
      margin?: [number, number, number, number];
      fontSize?: number;
      color?: string;
      link?: string;
      font?: string;
    }
  | { ul: unknown[]; margin?: [number, number, number, number] }
  | { ol: unknown[]; margin?: [number, number, number, number] }
  | {
      canvas: {
        type: string;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        lineWidth: number;
        lineColor: string;
      }[];
      margin: [number, number, number, number];
    }
  | null;

export function htmlToPdfContent(html: string): unknown[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const content: unknown[] = [];

  for (const node of doc.body.childNodes) {
    const item = convertNode(node);
    if (item !== null) content.push(item);
  }

  return content;
}

function convertNode(node: Node): PdfContent {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    return text || null;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    return convertElement(node as HTMLElement);
  }

  return null;
}

function convertElement(el: HTMLElement): PdfContent {
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    case "p": {
      const inline = processInline(el);
      if (!inline) return null;
      return { text: inline, margin: [0, 0, 0, 4] };
    }
    case "h1":
      return { text: el.textContent || "", style: "h1", margin: [0, 0, 0, 2] };
    case "h2":
      return {
        text: (el.textContent || "").toUpperCase(),
        style: "h2",
        margin: [0, 10, 0, 4],
      };
    case "h3":
      return { text: el.textContent || "", style: "h3", margin: [0, 8, 0, 2] };
    case "ul":
    case "ol":
      return convertList(el);
    case "hr":
      return {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 0.5,
            lineColor: "#ccc",
          },
        ],
        margin: [0, 6, 0, 6],
      };
    default: {
      const inline = processInline(el);
      return inline || null;
    }
  }
}

function processInline(el: HTMLElement): string | InlineSegment[] | null {
  const parts: InlineSegment[] = [];

  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) parts.push({ text });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as HTMLElement;
      const tag = child.tagName.toLowerCase();

      switch (tag) {
        case "strong":
        case "b":
          parts.push({ text: child.textContent || "", bold: true });
          break;
        case "em":
        case "i":
          parts.push({ text: child.textContent || "", italics: true });
          break;
        case "a":
          parts.push({
            text: child.textContent || "",
            link: child.getAttribute("href") || "",
            color: "#1d4ed8",
          });
          break;
        case "br":
          parts.push({ text: "" });
          break;
        case "code":
          parts.push({ text: child.textContent || "", font: "Courier" });
          break;
        default:
          parts.push({ text: child.textContent || "" });
      }
    }
  }

  if (parts.length === 0) return null;
  if (
    parts.length === 1 &&
    !parts[0].bold &&
    !parts[0].italics &&
    !parts[0].link &&
    !parts[0].font
  ) {
    return parts[0].text;
  }

  return parts;
}

function convertList(el: HTMLElement): PdfContent {
  const items: unknown[] = [];
  const ordered = el.tagName.toLowerCase() === "ol";

  for (const li of el.children) {
    if (li.tagName.toLowerCase() !== "li") continue;
    const inline = processInline(li as HTMLElement);
    items.push(inline || "");
  }

  return ordered ? { ol: items, margin: [0, 2, 0, 4] } : { ul: items, margin: [0, 2, 0, 4] };
}
