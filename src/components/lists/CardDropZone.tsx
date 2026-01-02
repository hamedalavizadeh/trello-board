"use client";

import { useDroppable } from "@dnd-kit/core";
import styles from "./CardDropZone.module.scss";

export function CardDropZone({ id }: { id: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return <div ref={setNodeRef} className={isOver ? styles.over : styles.zone} aria-hidden="true" />;
}
