require("tsx/cjs");

/** PM2 ecosystem bootstrap — source of truth is `scripts/ecosystem.config.ts`. */
module.exports = require("./scripts/ecosystem.config.ts").default;
