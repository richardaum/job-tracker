import "@ui/globals.css";

import type { Preview } from "@storybook/react-vite";
import { Mermaid } from "mdx-mermaid/Mermaid";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: {
        order: ["Documentation", ["Project", "Conventions", "Costs"], "*"],
      },
    },
    docs: { components: { mermaid: Mermaid, Mermaid } },
  },
};

export default preview;
