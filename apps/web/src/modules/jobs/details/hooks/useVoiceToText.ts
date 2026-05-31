"use client";

import { tryRun } from "@job-tracker/try-run";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { mergeFinalWithInterimSegments } from "./useMergedTranscriptSegments";
import { useSpeechRecognitionAutoRestart } from "./useSpeechRecognitionAutoRestart";

type UseVoiceToTextOptions = {
  enabled: boolean;
  disabled: boolean;
  language: string;
  getCurrentText: () => string;
  onTranscriptChange: (nextText: string) => void;
};

type SpeechRecognitionAlternative = { transcript: string };

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
  length: number;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultLike[];
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type VoiceToTextControllerRef = {
  recognition: SpeechRecognitionLike | null;
  dictationBaseText: string;
  enabled: boolean;
  disabled: boolean;
  language: string;
  speechRecognitionApi: SpeechRecognitionConstructor | null;
  autoRestart: ReturnType<typeof useSpeechRecognitionAutoRestart> | null;
  getCurrentText: () => string;
  onTranscriptChange: (nextText: string) => void;
};

export function useVoiceToText({
  enabled,
  disabled,
  language,
  getCurrentText,
  onTranscriptChange,
}: UseVoiceToTextOptions) {
  const [isListening, setIsListening] = useState(false);
  const autoRestart = useSpeechRecognitionAutoRestart({
    enabled,
    disabled,
    onListeningChange: setIsListening,
  });
  const controllerRef = useRef<VoiceToTextControllerRef>({
    recognition: null,
    dictationBaseText: "",
    enabled,
    disabled,
    language,
    speechRecognitionApi: null,
    autoRestart,
    getCurrentText,
    onTranscriptChange,
  });

  const speechRecognitionApi = useMemo<SpeechRecognitionConstructor | null>(() => {
    if (typeof window === "undefined") return null;
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
  }, []);

  const isSupported = speechRecognitionApi !== null;

  useEffect(() => {
    controllerRef.current.enabled = enabled;
    controllerRef.current.disabled = disabled;
    controllerRef.current.language = language;
    controllerRef.current.speechRecognitionApi = speechRecognitionApi;
    controllerRef.current.autoRestart = autoRestart;
    controllerRef.current.getCurrentText = getCurrentText;
    controllerRef.current.onTranscriptChange = onTranscriptChange;
  }, [
    autoRestart,
    disabled,
    enabled,
    getCurrentText,
    language,
    onTranscriptChange,
    speechRecognitionApi,
  ]);

  const setRecognition = useCallback((nextRecognition: SpeechRecognitionLike | null) => {
    controllerRef.current.recognition = nextRecognition;
  }, []);

  const applyVoiceToTextContent = useCallback((spokenText: string) => {
    const controller = controllerRef.current;
    const nextText = [controller.dictationBaseText, spokenText]
      .filter((part) => part.length > 0)
      .join("\n\n");
    controller.onTranscriptChange(nextText);
  }, []);

  const stop = useCallback(() => {
    const controller = controllerRef.current;
    controller.autoRestart?.stopSession(controller.recognition, setRecognition);
  }, [setRecognition]);

  const start = useCallback(() => {
    const controller = controllerRef.current;
    if (
      !controller.enabled ||
      controller.disabled ||
      !controller.speechRecognitionApi ||
      !controller.autoRestart
    ) {
      return;
    }
    const SpeechRecognitionApi = controller.speechRecognitionApi;

    controller.autoRestart.prepareSessionStart(controller.recognition, setRecognition);

    const startSession = (preserveBaseText: boolean) => {
      const activeController = controllerRef.current;
      if (activeController.disabled || !activeController.enabled || !activeController.autoRestart) {
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognitionApi();
      recognition.lang = activeController.language;
      recognition.continuous = true;
      recognition.interimResults = true;

      const nextBaseText = activeController.autoRestart.captureBaseTextIfNeeded(
        preserveBaseText,
        activeController.getCurrentText,
      );
      if (nextBaseText !== null) {
        activeController.dictationBaseText = nextBaseText;
      }

      recognition.onresult = (event) => {
        const finalParts: string[] = [];
        const interimParts: string[] = [];
        for (let index = 0; index < event.results.length; index += 1) {
          const result = event.results[index];
          if (!result || result.length === 0) continue;
          const transcript = result[0]?.transcript?.trim() ?? "";
          if (!transcript) continue;
          if (result.isFinal) {
            finalParts.push(transcript);
          } else {
            interimParts.push(transcript);
          }
        }
        const spokenText = mergeFinalWithInterimSegments(finalParts, interimParts);
        controllerRef.current.autoRestart?.markSpeechDetected(spokenText.length);
        applyVoiceToTextContent(spokenText);
      };
      recognition.onerror = () => {
        controllerRef.current.autoRestart?.handleSessionError();
      };
      recognition.onend = () => {
        const currentController = controllerRef.current;
        const shouldRestart = currentController.autoRestart?.handleSessionEnd(
          currentController.recognition,
          recognition,
          setRecognition,
        );
        if (shouldRestart) {
          startSession(true);
        }
      };

      controllerRef.current.recognition = recognition;
      setIsListening(true);

      const [startErr] = tryRun(() => recognition.start());
      if (startErr) {
        controllerRef.current.autoRestart?.handleSessionError();
        controllerRef.current.recognition = null;
      }
    };

    startSession(false);
  }, [applyVoiceToTextContent, setRecognition]);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
      return;
    }
    start();
  }, [isListening, start, stop]);

  useEffect(() => {
    if (disabled || !enabled) {
      stop();
    }
  }, [disabled, enabled, stop]);

  useEffect(() => {
    const controller = controllerRef.current;
    return () => {
      controller.autoRestart?.cleanupSession(controller.recognition, setRecognition);
    };
  }, [setRecognition]);

  return { isListening, isSupported, start, stop, toggle };
}
