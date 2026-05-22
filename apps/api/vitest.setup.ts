import { config } from "dotenv";

config({ path: ".env.test", override: true });
config({ path: ".env" });
config({ path: "../../.env.worktree", override: true });
