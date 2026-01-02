"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import styles from "./EditableText.module.scss";

type ActivateOn = "click" | "doubleClick";

type Props = {
  value: string;
  onCommit: (next: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  ariaLabel: string;
  maxLength?: number;
  as?: "h1" | "h2" | "h3" | "div" | "span";
  activateOn?: ActivateOn;
  onEditingChange?: (editing: boolean) => void;
};

export function EditableText({
  value,
  onCommit,
  className,
  inputClassName,
  placeholder,
  ariaLabel,
  maxLength = 140,
  as = "div",
  activateOn = "click",
  onEditingChange
}: Props) {
  const Tag = as as any;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (editing) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [editing]);

  const setEditingSafe = (next: boolean) => {
    setEditing(next);
    onEditingChange?.(next);
  };

  const commit = () => {
    setEditingSafe(false);
    const next = draft.trim();
    if (next && next !== value) onCommit(next);
    else setDraft(value);
  };

  const cancel = () => {
    setEditingSafe(false);
    setDraft(value);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={clsx(styles.input, inputClassName)}
        aria-label={ariaLabel}
        value={draft}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
      />
    );
  }

  const activate = () => setEditingSafe(true);

  return (
    <Tag
      className={clsx(styles.text, className)}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={activateOn === "click" ? activate : undefined}
      onDoubleClick={activateOn === "doubleClick" ? activate : undefined}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
      title={activateOn === "doubleClick" ? "Double-click to edit" : "Click to edit"}
    >
      {value || placeholder}
    </Tag>
  );
}
