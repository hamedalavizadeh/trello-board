"use client";

import { useState } from "react";
import styles from "./AddCardComposer.module.scss";
import { useBoardStore } from "@/store/boardStore";
import { PlusIcon, XIcon } from "@/components/icons";
import type { Id } from "@/types/domain";

export function AddCardComposer({ listId }: { listId: Id }) {
  const addCard = useBoardStore((s) => s.addCard);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const close = () => {
    setOpen(false);
    setTitle("");
  };

  const submit = () => {
    const trimmed = title.trim();
    addCard(listId, trimmed || "Untitled Card");
    setTitle("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        className={styles.addBtn}
        type="button"
        onClick={() => setOpen(true)}
      >
        <PlusIcon /> Add another card
      </button>
    );
  }

  return (
    <div className={styles.composer}>
      <textarea
        className={styles.textarea}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a card title..."
        rows={3}
        maxLength={180}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (title.trim()) submit();
          }

          if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
        }}
      />

      <div className={styles.actions}>
        <button
          className={styles.primary}
          type="button"
          onClick={submit}
          disabled={!title.trim()}
        >
          Create card
        </button>

        <button
          className={styles.closeBtn}
          type="button"
          aria-label="Close"
          onClick={close}
        >
          <XIcon />
        </button>
      </div>
    </div>
  );
}
