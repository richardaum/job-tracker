export type QuickTipPresentation = "paste-shortcut" | "ai-settings";

export type QuickTipAction = { label: string; href: string };

export const QUICK_TIPS_FEATURE_FLAG = "quick-tips-enabled";

export type QuickTip = {
  id: string;
  summary: string;
  description: string;
  steps: string[];
  presentation: QuickTipPresentation;
  action?: QuickTipAction;
};

export const QUICK_TIPS: QuickTip[] = [
  {
    id: "paste-to-draft:v1",
    summary: "Paste job description content to create a draft quickly.",
    description: "Create a job draft without filling out the form first.",
    presentation: "paste-shortcut",
    steps: [
      "Copy the job description content.",
      "Click anywhere outside a text field or editor in NewJobTracker.",
      "Paste it with ⌘V on Mac or Ctrl+V on Windows.",
      "Review the preview, choose your AI options, and create the draft.",
    ],
  },
  {
    id: "ai-settings:v1",
    summary: "Want more control over the AI features you use? Go to AI Settings.",
    description: "Choose which AI features are available for your job search.",
    presentation: "ai-settings",
    steps: [
      "Open AI Settings from your profile.",
      "Choose the AI features you want to use.",
      "Add a personal OpenAI key when you want to use your own account.",
    ],
    action: { label: "Go to AI settings", href: "/profile/ai/settings" },
  },
];

export function selectNextQuickTip(
  quickTips: QuickTip[],
  lastShownTipId: string | null,
  dismissedTipIds: string[],
): QuickTip | null {
  const eligibleTips = quickTips.filter((tip) => !dismissedTipIds.includes(tip.id));
  if (eligibleTips.length === 0) return null;

  const lastShownIndex = eligibleTips.findIndex((tip) => tip.id === lastShownTipId);
  return eligibleTips[(lastShownIndex + 1) % eligibleTips.length] ?? null;
}
