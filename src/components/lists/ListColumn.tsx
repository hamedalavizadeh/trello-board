"use client";

import clsx from "clsx";
import { useState } from "react";
import styles from "./ListColumn.module.scss";
import type { Card, Id, List } from "@/types/domain";
import { EditableText } from "@/components/ui/EditableText";
import { IconButton } from "@/components/ui/IconButton";
import { EllipsisIcon } from "@/components/icons";
import { useBoardStore } from "@/store/boardStore";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CardItem } from "@/components/cards/CardItem";
import { CardDropZone } from "@/components/lists/CardDropZone";
import { AddCardComposer } from "@/components/cards/AddCardComposer";
import { ListActionsPopover } from "@/components/lists/ListActionsPopover";
import { useListActionsPopover } from "@/hooks/useListActionsPopover";

const CARD_PREFIX = "card:";
const LISTDROP_PREFIX = "listdrop:";

type ActionsView = "menu" | "delete_list" | "delete_all_cards";

type Props = {
  listId: Id;
  list: List;
  cards: Card[];
  dragHandleProps?: Record<string, any>;
  setActivatorNodeRef?: (node: HTMLElement | null) => void;
  onTitleEditingChange?: (editing: boolean) => void;
  containerProps?: Record<string, any>;
  isOverlay?: boolean;
};

export function ListColumn({
  listId,
  list,
  cards,
  dragHandleProps,
  setActivatorNodeRef,
  onTitleEditingChange,
  containerProps,
  isOverlay = false,
}: Props) {
  const updateListTitle = useBoardStore((s) => s.updateListTitle);
  const deleteList = useBoardStore((s) => s.deleteList);
  const deleteAllCardsInList = useBoardStore((s) => s.deleteAllCardsInList);

  const cardSortableIds = list.cardOrder.map((cid) => `${CARD_PREFIX}${cid}`);
  const [titleEditing, setTitleEditing] = useState(false);

  const actions = useListActionsPopover();

  const canDragListHeader = !isOverlay && !titleEditing;
  const headerDragProps = canDragListHeader ? dragHandleProps : undefined;
  const headerRef = canDragListHeader
    ? (setActivatorNodeRef as any)
    : undefined;

  return (
    <section
      ref={actions.listRef as any}
      className={clsx(styles.column, isOverlay && styles.overlay)}
      role="listitem"
      {...(containerProps ?? {})}
    >
      <header className={styles.header}>
        <div
          ref={headerRef}
          className={styles.headerLeft}
          aria-label="Drag list"
          title={canDragListHeader ? "Drag list" : undefined}
          {...(headerDragProps ?? {})}
        >
          <EditableText
            value={list.title}
            ariaLabel="List title"
            onCommit={(t) => updateListTitle(listId, t)}
            className={styles.listTitle}
            inputClassName={styles.listTitleInput}
            maxLength={40}
            activateOn="click"
            onEditingChange={(editing) => {
              setTitleEditing(editing);
              onTitleEditingChange?.(editing);
            }}
          />
        </div>

        {!isOverlay ? (
          <IconButton
            ref={actions.btnRef as any}
            size="sm"
            aria-label="List actions"
            title="List actions"
            onClick={actions.toggle}
          >
            <EllipsisIcon />
          </IconButton>
        ) : null}
      </header>

      {!isOverlay ? (
        <ListActionsPopover
          open={actions.open}
          view={actions.view as ActionsView}
          anchorRect={actions.anchorRect}
          boundsRect={actions.boundsRect}
          onClose={actions.close}
          onBack={() => actions.setView("menu")}
          onPickDeleteList={() => actions.setView("delete_list")}
          onPickDeleteAll={() => actions.setView("delete_all_cards")}
          onConfirmDeleteList={() => {
            deleteList(listId);
            actions.close();
          }}
          onConfirmDeleteAll={() => {
            deleteAllCardsInList(listId);
            actions.close();
          }}
          containerRef={actions.popoverRef}
        />
      ) : null}

      <div className={styles.cardsArea}>
        {isOverlay ? (
          <div
            className={styles.cards}
            role="list"
            aria-label={`Cards in ${list.title}`}
          >
            {cards.map((c) => (
              <CardItem key={c.id} card={c} isOverlay />
            ))}
          </div>
        ) : (
          <>
            <SortableContext
              items={cardSortableIds}
              strategy={verticalListSortingStrategy}
            >
              <div
                className={styles.cards}
                role="list"
                aria-label={`Cards in ${list.title}`}
              >
                {cards.map((c) => (
                  <CardItem key={c.id} card={c} />
                ))}
              </div>
            </SortableContext>

            <CardDropZone id={`${LISTDROP_PREFIX}${listId}`} />
          </>
        )}
      </div>

      {!isOverlay ? <AddCardComposer listId={listId} /> : null}
    </section>
  );
}
