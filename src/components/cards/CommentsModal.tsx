"use client";

import { useState } from "react";
import styles from "./CommentsModal.module.scss";
import { Modal } from "@/components/ui/Modal";
import { useBoardStore } from "@/store/boardStore";
import type { Comment } from "@/types/domain";
import { XIcon } from "@/components/icons";

function format(ts: string) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      No comments yet. Be the first to comment!
    </div>
  );
}

function CommentRow({ c }: { c: Comment }) {
  return (
    <div className={styles.comment}>
      <div className={styles.commentMeta}>{`You · ${format(c.createdAt)}`}</div>
      <div className={styles.commentText}>{c.text}</div>
    </div>
  );
}

export function CommentsModal() {
  const { open, cardId } = useBoardStore((s) => s.commentsModal);
  const close = useBoardStore((s) => s.closeComments);
  const data = useBoardStore((s) => s.data);
  const addComment = useBoardStore((s) => s.addComment);

  const card = cardId ? data.cards[cardId] : null;
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!cardId) return;
    addComment(cardId, draft);
    setDraft("");
  };

  const titleText = card ? `Comments for "${card.title}"` : "Comments";

  return (
    <Modal
      open={open}
      onClose={close}
      ariaLabel={titleText}
      showTitleBar={false}
    >
      {!card ? (
        <div className={styles.empty}>Card not found.</div>
      ) : (
        <div className={styles.wrap}>
          <div className={styles.header}>
            <h2 className={styles.title}>{titleText}</h2>
            <button
              className={styles.closeBtn}
              type="button"
              aria-label="Close"
              onClick={close}
            >
              <XIcon />
            </button>
          </div>

          <div className={styles.commentList}>
            {card.comments.length === 0 ? (
              <EmptyState />
            ) : (
              card.comments.map((c) => <CommentRow key={c.id} c={c} />)
            )}
          </div>

          <div>
            <textarea
              className={styles.textarea}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              placeholder="Write a comment..."
              maxLength={600}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit();
              }}
            />

            <div className={styles.actions}>
              <button
                className={styles.primary}
                onClick={submit}
                disabled={!draft.trim()}
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
