import { resolve } from "node:path";

import { config as loadDotenv } from "dotenv";

// Playwright runs with cwd = apps/web (see package.json e2e script / CI).
const webRoot = process.cwd();

// Next.js precedence: .env.local overrides .env
loadDotenv({ path: resolve(webRoot, ".env") });
loadDotenv({ path: resolve(webRoot, ".env.local"), override: true });
