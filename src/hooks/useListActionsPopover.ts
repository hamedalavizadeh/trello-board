"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ListActionsView = "menu" | "delete_list" | "delete_all_cards";

export function useListActionsPopover() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ListActionsView>("menu");
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [boundsRect, setBoundsRect] = useState<DOMRect | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setView("menu");
    setAnchorRect(null);
    setBoundsRect(null);
  }, []);

  const updateRects = useCallback(() => {
    if (btnRef.current) setAnchorRect(btnRef.current.getBoundingClientRect());
    if (listRef.current) setBoundsRect(listRef.current.getBoundingClientRect());
  }, []);

  const toggle = useCallback(() => {
    updateRects();
    setView("menu");
    setOpen((v) => !v);
  }, [updateRects]);

  useEffect(() => {
    if (!open) return;
    updateRects();

    const onScroll = () => updateRects();
    const onResize = () => updateRects();

    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, updateRects]);

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (popoverRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      close();
    };

    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [open, close]);

  return {
    open,
    view,
    setView,
    anchorRect,
    boundsRect,
    popoverRef,
    btnRef,
    listRef,
    close,
    toggle,
  };
}
