"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./CardItem.module.scss";
import type { Card } from "@/types/domain";
import { useBoardStore } from "@/store/boardStore";

const CARD_PREFIX = "card:";

type Props = {
  card: Card;
  isOverlay?: boolean;
};

export function CardItem({ card, isOverlay = false }: Props) {
  const openComments = useBoardStore((s) => s.openComments);
  const updateCardTitle = useBoardStore((s) => s.updateCardTitle);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.title);

  useEffect(() => {
    if (!editing) setDraft(card.title);
  }, [card.title, editing]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${CARD_PREFIX}${card.id}`,
    data: { type: "card", cardId: card.id },
    disabled: editing || isOverlay,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  const commit = () => {
    const next = draft.trim();
    setEditing(false);
    if (!next) {
      setDraft(card.title);
      return;
    }
    if (next !== card.title) updateCardTitle(card.id, next);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(card.title);
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={clsx(styles.card, isOverlay && styles.overlay)}
      {...attributes}
      {...listeners}
    >
      <div className={styles.row}>
        {editing ? (
          <input
            className={styles.titleInput}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            maxLength={180}
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
        ) : (
          <button
            type="button"
            className={styles.titleBtn}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            aria-label="Card title"
            title="Double-click to edit"
            dir="auto"
          >
            {card.title}
          </button>
        )}

        <div className={styles.commentContainer}>
          <button
            className={styles.commentBtn}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openComments(card.id);
            }}
            aria-label="Open comments"
            title="Comments"
          >
            {`Comments (${card.comments.length})`}
          </button>
        </div>
      </div>
    </article>
  );
}
