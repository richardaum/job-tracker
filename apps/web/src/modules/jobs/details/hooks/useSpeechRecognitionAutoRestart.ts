"use client";

import { useCallback, useMemo, useRef } from "react";

type UseSpeechRecognitionAutoRestartOptions = {
  enabled: boolean;
  disabled: boolean;
  onListeningChange: (isListening: boolean) => void;
};

const MAX_CONSECUTIVE_NO_SPEECH_RESTARTS = 2;

export function useSpeechRecognitionAutoRestart({
  enabled,
  disabled,
  onListeningChange,
}: UseSpeechRecognitionAutoRestartOptions) {
  const shouldKeepListeningRef = useRef(false);
  const hasCapturedBaseTextRef = useRef(false);
  const sessionHadSpeechRef = useRef(false);
  const consecutiveNoSpeechRestartsRef = useRef(0);

  const setShouldKeepListening = useCallback((nextValue: boolean) => {
    shouldKeepListeningRef.current = nextValue;
  }, []);

  const stopSession = useCallback(
    <T extends { stop: () => void }>(
      recognition: T | null,
      setRecognition: (nextRecognition: T | null) => void,
    ) => {
      setShouldKeepListening(false);
      hasCapturedBaseTextRef.current = false;
      sessionHadSpeechRef.current = false;
      consecutiveNoSpeechRestartsRef.current = 0;
      recognition?.stop();
      setRecognition(null);
      onListeningChange(false);
    },
    [onListeningChange, setShouldKeepListening],
  );

  const prepareSessionStart = useCallback(
    <T extends { stop: () => void }>(
      recognition: T | null,
      setRecognition: (nextRecognition: T | null) => void,
    ) => {
      // Stop previous session first so stale `onend` cannot trigger restart.
      setShouldKeepListening(false);
      recognition?.stop();
      setRecognition(null);
      hasCapturedBaseTextRef.current = false;
      sessionHadSpeechRef.current = false;
      setShouldKeepListening(true);
    },
    [setShouldKeepListening],
  );

  const captureBaseTextIfNeeded = useCallback(
    (preserveBaseText: boolean, getCurrentText: () => string) => {
      // On auto-restart (preserveBaseText=true), refresh base text from the editor's
      // current content so the next recognition cycle appends instead of replacing.
      const shouldCapture = preserveBaseText || !hasCapturedBaseTextRef.current;
      if (!shouldCapture) return null;
      hasCapturedBaseTextRef.current = true;
      return getCurrentText().trim();
    },
    [],
  );

  const handleSessionError = useCallback(() => {
    setShouldKeepListening(false);
    hasCapturedBaseTextRef.current = false;
    sessionHadSpeechRef.current = false;
    consecutiveNoSpeechRestartsRef.current = 0;
    onListeningChange(false);
  }, [onListeningChange, setShouldKeepListening]);

  const markSpeechDetected = useCallback((spokenTextLen: number) => {
    if (spokenTextLen <= 0) return;
    sessionHadSpeechRef.current = true;
    consecutiveNoSpeechRestartsRef.current = 0;
  }, []);

  const handleSessionEnd = useCallback(
    <T>(
      currentRecognition: T | null,
      recognition: T,
      setRecognition: (nextRecognition: T | null) => void,
    ) => {
      if (currentRecognition === recognition) {
        setRecognition(null);
      }
      const wasNoSpeechSession = !sessionHadSpeechRef.current;
      if (wasNoSpeechSession) {
        consecutiveNoSpeechRestartsRef.current += 1;
      } else {
        consecutiveNoSpeechRestartsRef.current = 0;
      }
      const reachedNoSpeechLimit =
        wasNoSpeechSession &&
        consecutiveNoSpeechRestartsRef.current >=
          MAX_CONSECUTIVE_NO_SPEECH_RESTARTS;
      const shouldRestart =
        shouldKeepListeningRef.current &&
        !disabled &&
        enabled &&
        !reachedNoSpeechLimit;
      sessionHadSpeechRef.current = false;
      if (!shouldRestart) {
        if (reachedNoSpeechLimit) {
          setShouldKeepListening(false);
        }
        hasCapturedBaseTextRef.current = false;
        consecutiveNoSpeechRestartsRef.current = 0;
        onListeningChange(false);
      }
      return shouldRestart;
    },
    [disabled, enabled, onListeningChange, setShouldKeepListening],
  );

  const cleanupSession = useCallback(
    <T extends { stop: () => void }>(
      recognition: T | null,
      setRecognition: (nextRecognition: T | null) => void,
    ) => {
      setShouldKeepListening(false);
      hasCapturedBaseTextRef.current = false;
      sessionHadSpeechRef.current = false;
      consecutiveNoSpeechRestartsRef.current = 0;
      recognition?.stop();
      setRecognition(null);
    },
    [setShouldKeepListening],
  );

  return useMemo(
    () => ({
      stopSession,
      prepareSessionStart,
      captureBaseTextIfNeeded,
      markSpeechDetected,
      handleSessionError,
      handleSessionEnd,
      cleanupSession,
    }),
    [
      stopSession,
      prepareSessionStart,
      captureBaseTextIfNeeded,
      markSpeechDetected,
      handleSessionError,
      handleSessionEnd,
      cleanupSession,
    ],
  );
}
