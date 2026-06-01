"use client";

import { useEffect, useRef, useState } from "react";

interface ObfuscatedTextProps {
  text: string;
  obfuscatedText: string;
  revealDelayMs?: number;
}

export function ObfuscatedText({ text, obfuscatedText, revealDelayMs = 3000 }: ObfuscatedTextProps) {
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  function handleMouseEnter() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      hoverTimeoutRef.current = null;
    }, revealDelayMs);
  }

  function handleMouseLeave() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsVisible(false);
  }

  return (
    <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {isVisible ? text : obfuscatedText}
    </span>
  );
}
