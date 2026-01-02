"use client";

import { useState } from "react";
import styles from "./AddListComposer.module.scss";
import { useBoardStore } from "@/store/boardStore";
import { PlusIcon, XIcon } from "@/components/icons";

export function AddListComposer() {
  const addList = useBoardStore((s) => s.addList);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const close = () => {
    setOpen(false);
    setTitle("");
  };

  const submit = () => {
    const trimmed = title.trim();
    addList(trimmed || "Untitled List");
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
        <PlusIcon /> Add another list
      </button>
    );
  }

  return (
    <div className={styles.composer}>
      <input
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a list title..."
        maxLength={40}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
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
          Add list
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
