"use client";

import { cn } from "@job-tracker/ui";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { LoginV2SideTile } from "@/modules/auth/login/LoginV2SideTile";
import type { LoginSpotlightIconKey } from "@/modules/auth/login/mockLoginSpotlightTiles";

// Matches LoginV2SideTile's `w-48` size.
const TILE_WIDTH = 192;
const TILE_HEIGHT = 74;
const GAP = 16;

// Used only for the very first paint, before ResizeObserver reports the card's real size.
const FALLBACK_CARD_WIDTH = 384;
const FALLBACK_CARD_HEIGHT = 340;

const ORBIT_DURATION_S = 36;

const ORBIT_TILES: ReadonlyArray<{ icon: LoginSpotlightIconKey; title: string }> = [
  { icon: "briefcase", title: "Every job in one place" },
  { icon: "chartLineUp", title: "Pipeline at a glance" },
  { icon: "calculator", title: "Know your number" },
  { icon: "target", title: "See your fit before you apply" },
];

type Track = { containerWidth: number; containerHeight: number; path: string };

// The path tiles travel on is the card's box expanded by the tile's own half-extent on each axis
// (a Minkowski sum of two axis-aligned rectangles is itself a rectangle — no corner rounding
// needed) plus a visual gap, so a non-rotating tile can never overlap the card at any point —
// as long as `cardWidth`/`cardHeight` match the card's actual rendered size.
function buildTrack(cardWidth: number, cardHeight: number): Track {
  const trackHalfWidth = cardWidth / 2 + TILE_WIDTH / 2 + GAP;
  const trackHalfHeight = cardHeight / 2 + TILE_HEIGHT / 2 + GAP;
  const containerWidth = trackHalfWidth * 2 + TILE_WIDTH;
  const containerHeight = trackHalfHeight * 2 + TILE_HEIGHT;
  const left = containerWidth / 2 - trackHalfWidth;
  const right = containerWidth / 2 + trackHalfWidth;
  const top = containerHeight / 2 - trackHalfHeight;
  const bottom = containerHeight / 2 + trackHalfHeight;

  return {
    containerWidth,
    containerHeight,
    path: `M ${left} ${top} L ${right} ${top} L ${right} ${bottom} L ${left} ${bottom} Z`,
  };
}

type LoginV2OrbitProps = { children: ReactNode; className?: string };

/** Center card with 4 tiles gliding around it on a rectangular track ([LoginV2]). */
export function LoginV2Orbit({ children, className }: LoginV2OrbitProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardSize, setCardSize] = useState({ width: FALLBACK_CARD_WIDTH, height: FALLBACK_CARD_HEIGHT });

  useLayoutEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry?.contentRect ?? {};
      if (width && height) setCardSize({ width, height });
    });
    observer.observe(cardEl);
    return () => observer.disconnect();
  }, []);

  const track = buildTrack(cardSize.width, cardSize.height);

  return (
    <div className={cn("relative", className)} style={{ width: track.containerWidth, height: track.containerHeight }}>
      <div ref={cardRef} className={cn("absolute top-1/2 left-1/2 z-10 -translate-1/2")}>
        {children}
      </div>

      {ORBIT_TILES.map((tile, index) => (
        <div
          key={tile.title}
          className={cn("absolute top-0 left-0 animate-login-v2-orbit-track")}
          style={{
            offsetPath: `path("${track.path}")`,
            animationDelay: `${-(index / ORBIT_TILES.length) * ORBIT_DURATION_S}s`,
          }}
        >
          <LoginV2SideTile icon={tile.icon} title={tile.title} />
        </div>
      ))}
    </div>
  );
}
