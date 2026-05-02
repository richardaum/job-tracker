import "../src/globals.css";

import type { Preview } from "@storybook/react";
import { Mermaid } from "mdx-mermaid/Mermaid";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: { order: ["Documentation", ["Project", "Conventions"], "*"] },
    },
    docs: { components: { mermaid: Mermaid, Mermaid } },
  },
};

export default preview;
