"use client";

import styles from "./page.module.scss";
import { BoardHeader } from "@/components/board/BoardHeader";
import { BoardView } from "@/components/board/BoardView";
import { CommentsModal } from "@/components/cards/CommentsModal";
import { useHydrateBoard } from "@/hooks/useHydrateBoard";
import { useBoardStore } from "@/store/boardStore";

export default function Page() {
  useHydrateBoard();

  const hydrated = useBoardStore((s) => s.hydrated);

  return (
    <main className={styles.page}>
      <BoardHeader />

      {hydrated ? (
        <BoardView />
      ) : (
        <div className={styles.loading}>Loading board...</div>
      )}

      <CommentsModal />
    </main>
  );
}
