"use client";

import styles from "./BoardHeader.module.scss";
import { EditableText } from "@/components/ui/EditableText";
import { IconButton } from "@/components/ui/IconButton";
import { useBoardStore } from "@/store/boardStore";
import { TrashIcon } from "@/components/icons";
import { clearStorage } from "@/services/storage";

export function BoardHeader() {
  const title = useBoardStore((s) => s.data.board.title);
  const updateBoardTitle = useBoardStore((s) => s.updateBoardTitle);
  const hydrate = useBoardStore((s) => s.hydrate);

  const reset = () => {
    clearStorage();
    hydrate();
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <EditableText
          as="h1"
          value={title}
          ariaLabel="Board title"
          onCommit={updateBoardTitle}
          className={styles.title}
          inputClassName={styles.titleInput}
          maxLength={60}
        />
      </div>

      <div className={styles.right}>
        <IconButton
          variant="solid"
          size="md"
          aria-label="Reset demo (clear localStorage)"
          title="Reset demo (clear localStorage)"
          onClick={reset}
        >
          <TrashIcon />
        </IconButton>
      </div>
    </header>
  );
}
