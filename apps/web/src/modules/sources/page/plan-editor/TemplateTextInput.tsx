"use client";

import { cn, Text } from "@job-tracker/ui";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AutocompleteInput } from "@/modules/sources/page/plan-editor/AutocompleteInput";
import { autocompleteAt, validateTokens } from "@/modules/sources/page/plan-editor/utils";

export interface TemplateField {
  label: string;
  value: string;
}

type TemplateTextInputProps = {
  value: string;
  onChange: (value: string) => void;
  fields: TemplateField[];
  placeholder?: string;
  onValidationError?: (error: string | null) => void;
};

export function TemplateTextInput({ value, onChange, fields, placeholder, onValidationError }: TemplateTextInputProps) {
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [autocompleteContext, setAutocompleteContext] = useState<{ prefix: string; partial: string } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const prevCtxRef = useRef<{ prefix: string; partial: string } | null>(null);

  const validKeys = useMemo(() => new Set(fields.map((f) => f.value)), [fields]);
  const { error } = useMemo(() => validateTokens(value, validKeys), [value, validKeys]);

  useEffect(() => {
    onValidationError?.(error);
  }, [error, onValidationError]);

  const matches = useMemo(() => {
    if (!autocompleteContext) return [];
    const query = autocompleteContext.partial.toLowerCase();
    return fields.filter((f) => f.value.toLowerCase().includes(query));
  }, [autocompleteContext, fields]);

  const effectiveIndex = matches.length === 0 ? 0 : Math.min(selectedIndex, matches.length - 1);

  function syncAutocomplete(currentValue: string, cursor: number) {
    const ctx = autocompleteAt(currentValue, cursor);
    setAutocompleteContext(ctx);
    if (ctx) {
      if (prevCtxRef.current || currentValue.length > value.length) {
        setAutocompleteOpen(true);
      }
    } else {
      setAutocompleteOpen(false);
    }
    prevCtxRef.current = ctx;
  }

  function selectField(fieldValue: string) {
    if (!autocompleteContext) return;
    const cursor = autocompleteContext.prefix.length + 2 + autocompleteContext.partial.length;
    const closePos = value.indexOf("}}", cursor);
    const end = closePos !== -1 ? closePos + 2 : value.length;
    const next = autocompleteContext.prefix + "{{" + fieldValue + "}}" + value.slice(end);
    onChange(next);
    setAutocompleteOpen(false);
  }

  return (
    <div className={cn("flex flex-col gap-1.5")}>
      <AutocompleteInput
        value={value}
        onChange={(v, cursor) => {
          onChange(v);
          syncAutocomplete(v, cursor);
        }}
        onCursorChange={(cursor) => syncAutocomplete(value, cursor)}
        open={autocompleteOpen}
        onOpenChange={(next) => {
          setAutocompleteOpen(next);
          if (!next) setAutocompleteContext(null);
        }}
        options={matches}
        selectedIndex={effectiveIndex}
        onSelectedIndexChange={setSelectedIndex}
        onSelect={(opt) => selectField(opt.value)}
        placeholder={placeholder}
        state={error ? "error" : "default"}
        inputClassName={cn("pr-4 font-mono text-xs")}
      />

      {error && (
        <Text size="xs" color="error" className={cn("inline-flex items-center gap-1")}>
          <WarningCircleIcon size={12} weight="fill" />
          {error}
        </Text>
      )}
    </div>
  );
}
