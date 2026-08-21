"use client";

import { Button, cn, Dialog, IconButton, conceptIcon, Text } from "@job-tracker/ui";
import { tryRun } from "@job-tracker/try-run";
import NextLink from "next/link";
import { useEffect, useState } from "react";

import { useUpdateSettingsMutation } from "@/gql/hooks";

import { QUICK_TIPS, selectNextQuickTip } from "./quick-tips.shared";

interface QuickTipsProps {
  lastShownTipId: string | null;
  dismissedTipIds: string[];
}

export function QuickTips({ lastShownTipId, dismissedTipIds }: QuickTipsProps) {
  const [updateSettings] = useUpdateSettingsMutation();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [tip] = useState(() => selectNextQuickTip(QUICK_TIPS, lastShownTipId, dismissedTipIds));
  const TipIcon = conceptIcon.star;
  const ViewTipIcon = conceptIcon.externalLink;
  const PasteIcon = conceptIcon.paste;
  const SettingsIcon = conceptIcon.settings;
  const DismissIcon = conceptIcon.close;

  useEffect(() => {
    if (!tip || tip.id === lastShownTipId) return;

    void updateSettings({ variables: { input: { lastQuickTipId: tip.id } } });
  }, [lastShownTipId, tip, updateSettings]);

  async function handleDismiss() {
    if (!tip || dismissing) return;

    setDismissing(true);
    const [error] = await tryRun(
      updateSettings({ variables: { input: { dismissedQuickTipIds: [...dismissedTipIds, tip.id] } } }),
    );
    setDismissing(false);

    if (!error) setDismissed(true);
  }

  if (!tip || dismissed) return null;

  return (
    <>
      <div className={cn("mx-1 mb-3 rounded-md border border-border-default bg-bg-surface-subtle px-3 pt-2 pb-3")}>
        <div className={cn("flex items-center justify-between gap-2")}>
          <div className={cn("flex min-w-0 items-center gap-1")}>
            <TipIcon size={13} weight="regular" className={cn("shrink-0 text-text-secondary")} aria-hidden />
            <Text size="xs" weight="semibold" className={cn("text-text-secondary uppercase tracking-wider")}>
              Quick tips
            </Text>
          </div>
          <div className={cn("flex items-center gap-0")}>
            <IconButton
              icon={<ViewTipIcon size={14} weight="regular" />}
              intent="quiet"
              label="View quick tip"
              size="xs"
              tooltip="View tip"
              onClick={() => setOpen(true)}
            />
            <IconButton
              icon={<DismissIcon size={14} weight="regular" />}
              intent="quiet"
              label="Dismiss quick tip"
              size="xs"
              tooltip="Dismiss tip"
              disabled={dismissing}
              onClick={() => void handleDismiss()}
            />
          </div>
        </div>
        <Text size="xs" className={cn("text-text-secondary")}>
          {tip.summary}
        </Text>
      </div>
      <Dialog
        title="Quick tips"
        description={tip.description}
        open={open}
        onOpenChange={setOpen}
        size="md"
        footer={
          <div className={cn("flex justify-end")}>
            {tip.action ? (
              <Button asChild intent="primary">
                <NextLink href={tip.action.href} onClick={() => setOpen(false)}>
                  {tip.action.label}
                </NextLink>
              </Button>
            ) : (
              <Button intent="primary" onClick={() => setOpen(false)}>
                I’ll try it
              </Button>
            )}
          </div>
        }
      >
        <div className={cn("space-y-5")}>
          {tip.presentation === "paste-shortcut" ? (
            <div className={cn("rounded-lg border border-border-brand bg-bg-brand-subtle p-4")}>
              <div className={cn("flex items-start gap-3")}>
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-md bg-bg-brand text-text-inverted shadow-sm",
                  )}
                >
                  <PasteIcon size={18} weight="regular" aria-hidden />
                </div>
                <div className={cn("min-w-0 flex-1")}>
                  <Text size="xs" weight="semibold" className={cn("uppercase tracking-wider text-text-brand")}>
                    The shortcut
                  </Text>
                  <div className={cn("mt-2 flex flex-wrap items-center gap-2")}>
                    <kbd
                      className={cn(
                        "rounded-md border border-border-default bg-bg-surface px-2.5 py-1 font-mono text-sm font-semibold text-text-primary shadow-sm",
                      )}
                    >
                      ⌘V
                    </kbd>
                    <Text size="xs" color="muted">
                      on Mac
                    </Text>
                    <span aria-hidden className={cn("text-text-muted")}>
                      /
                    </span>
                    <kbd
                      className={cn(
                        "rounded-md border border-border-default bg-bg-surface px-2.5 py-1 font-mono text-sm font-semibold text-text-primary shadow-sm",
                      )}
                    >
                      Ctrl+V
                    </kbd>
                    <Text size="xs" color="muted">
                      on Windows
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={cn("rounded-lg border border-border-brand bg-bg-brand-subtle p-4")}>
              <div className={cn("flex items-center gap-3")}>
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-md bg-bg-brand text-text-inverted shadow-sm",
                  )}
                >
                  <SettingsIcon size={18} weight="regular" aria-hidden />
                </div>
                <Text size="sm" weight="medium" className={cn("text-text-secondary")}>
                  Tune your AI setup to match how you want to work.
                </Text>
              </div>
            </div>
          )}

          <div>
            <Text size="xs" weight="semibold" className={cn("uppercase tracking-wider text-text-muted")}>
              How it works
            </Text>
            <ol className={cn("mt-3 space-y-3")}>
              {tip.steps.map((step, index) => (
                <li key={step} className={cn("grid grid-cols-[1.75rem_1fr] items-start gap-3")}>
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border border-border-default bg-bg-surface text-xs font-semibold text-text-secondary",
                    )}
                  >
                    {index + 1}
                  </span>
                  <Text size="sm" className={cn("pt-1 text-text-secondary")}>
                    {step}
                  </Text>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Dialog>
    </>
  );
}
