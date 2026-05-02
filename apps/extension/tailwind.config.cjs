/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      /**
       * Maps design-system semantics used by @job-tracker/ui (e.g. Badge) to CSS
       * vars from tokens.css. Class names mirror Tailwind v4 @theme conventions
       * (e.g. bg-bg-surface → color key bg-surface).
       */
      colors: {
        "text-primary": "var(--semantic-color-text-primary)",
        "text-muted": "var(--semantic-color-text-muted)",
        "text-inverted": "var(--semantic-color-text-inverted)",
        "bg-surface": "var(--semantic-color-bg-surface)",
        "bg-surface-hover": "var(--semantic-color-bg-surface-hover)",
        "bg-brand": "var(--semantic-color-bg-brand)",
        "bg-brand-hover": "var(--semantic-color-bg-brand-hover)",
        "bg-brand-subtle": "var(--semantic-color-bg-brand-subtle)",
        "bg-success-subtle": "var(--semantic-color-bg-success-subtle)",
        "bg-warning-subtle": "var(--semantic-color-bg-warning-subtle)",
        "bg-error-subtle": "var(--semantic-color-bg-error-subtle)",
        "bg-info-subtle": "var(--semantic-color-bg-info-subtle)",
        "border-default": "var(--semantic-color-border-default)",
        "border-strong": "var(--semantic-color-border-strong)",
        "border-brand": "var(--semantic-color-border-brand)",
        "border-error": "var(--semantic-color-border-error)",
        "text-secondary": "var(--semantic-color-text-secondary)",
        "text-success": "var(--semantic-color-text-success)",
        "text-warning": "var(--semantic-color-text-warning)",
        "text-error": "var(--semantic-color-text-error)",
        "text-brand": "var(--semantic-color-text-brand)",
      },
    },
  },
  plugins: [],
};
