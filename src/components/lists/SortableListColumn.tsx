"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { useBoardStore } from "@/store/boardStore";
import { ListColumn } from "@/components/lists/ListColumn";
import type { Id } from "@/types/domain";

const LIST_PREFIX = "list:";

export function SortableListColumn({ listId }: { listId: Id }) {
  const list = useBoardStore((s) => s.data.lists[listId]);
  const cardsById = useBoardStore((s) => s.data.cards);
  const order = list?.cardOrder ?? [];
  const cards = order.map((cid) => cardsById[cid]).filter(Boolean);

  const [titleEditing, setTitleEditing] = useState(false);

  const { setNodeRef, setActivatorNodeRef, transform, transition, attributes, listeners, isDragging } = useSortable({
    id: `${LIST_PREFIX}${listId}`,
    data: { type: "list", listId },
    disabled: titleEditing
  });

  if (!list) return null;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ListColumn
        listId={listId}
        list={list}
        cards={cards}
        setActivatorNodeRef={setActivatorNodeRef}
        dragHandleProps={{ ...attributes, ...listeners }}
        onTitleEditingChange={setTitleEditing}
      />
    </div>
  );
}