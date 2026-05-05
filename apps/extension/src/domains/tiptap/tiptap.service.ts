import { generateJSON } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

/** Same surface as the web app editor so scraped HTML maps to compatible JSON. */
const SCRAPE_EXTENSIONS = [StarterKit];

/** TipTap `generateJSON` document shape for scraped HTML (StarterKit). */
export type TipTapDocFromHtml = ReturnType<typeof generateJSON>;

/**
 * HTML → TipTap document JSON (`@tiptap/html` resolves browser vs Node via
 * package `exports`; Node uses happy-dom internally).
 */
export class TiptapService {
  htmlFragmentToJson(html: string): TipTapDocFromHtml {
    return generateJSON(html, SCRAPE_EXTENSIONS);
  }

  htmlFragmentToJsonString(html: string): string {
    return JSON.stringify(this.htmlFragmentToJson(html));
  }
}
