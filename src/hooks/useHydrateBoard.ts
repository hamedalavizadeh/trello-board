"use client";

import { useEffect } from "react";
import { useBoardStore } from "@/store/boardStore";

export function useHydrateBoard() {
  const hydrate = useBoardStore((s) => s.hydrate);
  const hydrated = useBoardStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);
}
