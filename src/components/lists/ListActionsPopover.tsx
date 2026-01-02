"use client";

import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import styles from "./ListActionsPopover.module.scss";
import { ChevronLeftIcon, XIcon } from "@/components/icons";

type View = "menu" | "delete_list" | "delete_all_cards";

type Props = {
  open: boolean;
  view: View;
  anchorRect: DOMRect | null;
  boundsRect?: DOMRect | null;
  onClose: () => void;
  onBack: () => void;
  onPickDeleteList: () => void;
  onPickDeleteAll: () => void;
  onConfirmDeleteList: () => void;
  onConfirmDeleteAll: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
};

const POPOVER_WIDTH = 284;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function ListActionsPopover({
  open,
  view,
  anchorRect,
  boundsRect,
  onClose,
  onBack,
  onPickDeleteList,
  onPickDeleteAll,
  onConfirmDeleteList,
  onConfirmDeleteAll,
  containerRef,
}: Props) {
  const el = useMemo(() => (typeof document !== "undefined" ? document.createElement("div") : null), []);

  useEffect(() => {
    if (!open || !el) return;
    document.body.appendChild(el);
    return () => {
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

  if (!open || !el || !anchorRect) return null;

  const title =
    view === "menu"
      ? "List Actions"
      : view === "delete_all_cards"
        ? "Delete All Cards"
        : "Delete List";

  const showBack = view !== "menu";

  const viewportPad = 8;
  const overlap = 24;

  const leftBase = anchorRect.right - overlap;
  const left = clamp(leftBase, viewportPad, window.innerWidth - POPOVER_WIDTH - viewportPad);
  const top = clamp(anchorRect.bottom + 6, viewportPad, window.innerHeight - viewportPad);

  void boundsRect;

  return createPortal(
    <div
      className={styles.popover}
      ref={containerRef}
      role="dialog"
      aria-label={title}
      style={{ left, top }}
    >
      <div className={styles.topbar}>
        {showBack ? (
          <button className={styles.iconBtn} type="button" aria-label="Back" onClick={onBack}>
            <ChevronLeftIcon />
          </button>
        ) : (
          <div className={styles.spacer} aria-hidden="true" />
        )}
        <div className={styles.title}>{title}</div>
        <button className={styles.iconBtn} type="button" aria-label="Close" onClick={onClose}>
          <XIcon />
        </button>
      </div>

      {view === "menu" ? (
        <div className={styles.menu}>
          <button className={styles.menuItem} type="button" onClick={onPickDeleteList}>
            Delete List
          </button>
          <button className={`${styles.menuItem} ${styles.menuItemDanger}`} type="button" onClick={onPickDeleteAll}>
            Delete All Cards
          </button>
        </div>
      ) : view === "delete_all_cards" ? (
        <div className={styles.confirm}>
          <p className={styles.message}>This will remove all the cards in this list from the board.</p>
          <button className={styles.dangerBtn} type="button" onClick={onConfirmDeleteAll}>
            Delete all
          </button>
        </div>
      ) : (
        <div className={styles.confirm}>
          <p className={styles.message}>
            All actions will be removed from the activity feed and you won’t be able to re-open the list. There is no undo.
          </p>
          <button className={styles.dangerBtn} type="button" onClick={onConfirmDeleteList}>
            Delete list
          </button>
        </div>
      )}
    </div>,
    el
  );
}