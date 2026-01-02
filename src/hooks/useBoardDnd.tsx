"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Card, Id, NormalizedBoardData } from "@/types/domain";
import { useBoardStore } from "@/store/boardStore";
import { ListColumn } from "@/components/lists/ListColumn";
import { CardItem } from "@/components/cards/CardItem";

const LIST_PREFIX = "list:";
const CARD_PREFIX = "card:";
const LISTDROP_PREFIX = "listdrop:";

function isListId(dndId: string) {
  return dndId.startsWith(LIST_PREFIX);
}

function isCardId(dndId: string) {
  return dndId.startsWith(CARD_PREFIX);
}

function isListDropId(dndId: string) {
  return dndId.startsWith(LISTDROP_PREFIX);
}

function stripPrefix(dndId: string) {
  return dndId.split(":")[1] ?? dndId;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function findCardMeta(
  data: NormalizedBoardData,
  cardId: Id
): { listId: Id; index: number } | null {
  for (const listId of data.board.listOrder) {
    const order = data.lists[listId]?.cardOrder ?? [];
    const index = order.indexOf(cardId);
    if (index !== -1) return { listId, index };
  }
  return null;
}

type ActiveDrag =
  | { type: "list"; listId: Id }
  | { type: "card"; cardId: Id }
  | null;

export function useBoardDnd(data: NormalizedBoardData) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    })
  );

  const [active, setActive] = useState<ActiveDrag>(null);
  const activeRef = useRef<ActiveDrag>(null);

  const setActiveSafe = useCallback((next: ActiveDrag) => {
    activeRef.current = next;
    setActive(next);
  }, []);

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);
      if (isListId(id))
        setActiveSafe({ type: "list", listId: stripPrefix(id) });
      else if (isCardId(id))
        setActiveSafe({ type: "card", cardId: stripPrefix(id) });
    },
    [setActiveSafe]
  );

  const onDragOver = useCallback((event: DragOverEvent) => {
    if (!event.over) return;

    const currentActive = activeRef.current;
    if (!currentActive || currentActive.type !== "card") return;

    const activeCardId = currentActive.cardId;
    const overId = String(event.over.id);

    const current = useBoardStore.getState().data;
    const activeMeta = findCardMeta(current, activeCardId);
    if (!activeMeta) return;

    let overListId: Id | null = null;
    let overIndex: number | null = null;

    if (isCardId(overId)) {
      const overCardId = stripPrefix(overId);
      const overMeta = findCardMeta(current, overCardId);
      if (!overMeta) return;

      overListId = overMeta.listId;
      let nextIndex = overMeta.index;

      const activeRect =
        event.active.rect.current.translated ??
        event.active.rect.current.initial;
      const overRect = event.over.rect;

      if (activeRect && overRect) {
        const activeMidY = activeRect.top + activeRect.height / 2;
        const overMidY = overRect.top + overRect.height / 2;
        if (activeMidY > overMidY) nextIndex = overMeta.index + 1;
      }

      overIndex = nextIndex;
    } else if (isListDropId(overId) || isListId(overId)) {
      overListId = stripPrefix(overId);
      overIndex = (current.lists[overListId]?.cardOrder ?? []).length;
    }

    if (!overListId || overIndex === null) return;
    if (!current.lists[overListId]) return;

    const fromListId = activeMeta.listId;
    const overLen = (current.lists[overListId]?.cardOrder ?? []).length;

    const safeIndex = clamp(overIndex, 0, overLen);

    if (fromListId !== overListId) {
      useBoardStore.getState().moveCard(activeCardId, overListId, safeIndex);
      return;
    }

    if (activeMeta.index !== safeIndex) {
      useBoardStore
        .getState()
        .reorderCards(fromListId, activeMeta.index, safeIndex);
    }
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!event.over) {
        setActiveSafe(null);
        return;
      }

      const activeId = String(event.active.id);
      const overId = String(event.over.id);

      if (isListId(activeId)) {
        const current = useBoardStore.getState().data;
        const activeListId = stripPrefix(activeId);

        let targetListId: Id | null = null;

        if (isListId(overId) || isListDropId(overId)) {
          targetListId = stripPrefix(overId);
        } else if (isCardId(overId)) {
          const overCardId = stripPrefix(overId);
          targetListId = findCardMeta(current, overCardId)?.listId ?? null;
        }

        if (targetListId) {
          const fromIndex = current.board.listOrder.indexOf(activeListId);
          const toIndex = current.board.listOrder.indexOf(targetListId);
          if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
            useBoardStore.getState().moveListByIndex(fromIndex, toIndex);
          }
        }
      }

      setActiveSafe(null);
    },
    [setActiveSafe]
  );

  const overlay = useMemo(() => {
    if (!active) return null;

    if (active.type === "list") {
      const list = data.lists[active.listId];
      if (!list) return null;
      const cards = list.cardOrder
        .map((cid) => data.cards[cid])
        .filter((c): c is Card => Boolean(c));
      return (
        <ListColumn
          listId={active.listId}
          list={list}
          cards={cards}
          isOverlay
        />
      );
    }

    const card = data.cards[active.cardId];
    if (!card) return null;
    return <CardItem card={card} isOverlay />;
  }, [active, data]);

  return {
    sensors,
    active,
    overlay,
    onDragStart,
    onDragOver,
    onDragEnd,
  };
}
