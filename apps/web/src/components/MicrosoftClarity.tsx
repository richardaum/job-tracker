"use client";

import Script from "next/script";
import { useFeatureFlagEnabled } from "posthog-js/react";

const MICROSOFT_CLARITY_FEATURE_FLAG = "microsoft-clarity-enabled";
const MICROSOFT_CLARITY_PROJECT_ID = "y931dtlh5f";

export function MicrosoftClarity() {
  const clarityEnabled = useFeatureFlagEnabled(MICROSOFT_CLARITY_FEATURE_FLAG) ?? false;

  if (!clarityEnabled) return null;

  return (
    <Script
      id="microsoft-clarity-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){ c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y); })(window, document, "clarity", "script",
          "${MICROSOFT_CLARITY_PROJECT_ID}");
        `,
      }}
    />
  );
}
