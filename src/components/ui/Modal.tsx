"use client";

import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.scss";

type Props = {
  open: boolean;
  title?: string;
  ariaLabel?: string;
  showTitleBar?: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ open, title, ariaLabel, showTitleBar = true, onClose, children }: Props) {
  const el = useMemo(() => (typeof document !== "undefined" ? document.createElement("div") : null), []);

  useEffect(() => {
    if (!open || !el) return;

    document.body.appendChild(el);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      try {
        document.body.removeChild(el);
      } catch {
      }
    };
  }, [open, el]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !el) return null;

  const label = ariaLabel ?? title ?? "Dialog";

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={label}>
      <div className={styles.backdrop} onMouseDown={onClose} />
      <div className={styles.panel} onMouseDown={(e) => e.stopPropagation()}>
        {showTitleBar && title ? <div className={styles.title}>{title}</div> : null}
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    el
  );
}