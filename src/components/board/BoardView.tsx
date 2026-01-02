"use client";

import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import styles from "./BoardView.module.scss";
import { useBoardStore } from "@/store/boardStore";
import { SortableListColumn } from "@/components/lists/SortableListColumn";
import { AddListComposer } from "@/components/lists/AddListComposer";
import { useBoardDnd } from "@/hooks/useBoardDnd";

const LIST_PREFIX = "list:";

export function BoardView() {
  const data = useBoardStore((s) => s.data);
  const { sensors, overlay, onDragStart, onDragOver, onDragEnd } =
    useBoardDnd(data);

  const listIds = data.board.listOrder;
  const listSortableIds = listIds.map((id) => `${LIST_PREFIX}${id}`);

  return (
    <div className={styles.boardArea}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        modifiers={[restrictToWindowEdges]}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={listSortableIds}
          strategy={horizontalListSortingStrategy}
        >
          <div className={styles.listsRow} role="list" aria-label="Board lists">
            {listIds.map((listId) => (
              <SortableListColumn key={listId} listId={listId} />
            ))}

            <div className={styles.addListSlot}>
              <AddListComposer />
            </div>
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={null}>{overlay}</DragOverlay>
      </DndContext>
    </div>
  );
}
