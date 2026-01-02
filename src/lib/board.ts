import type { Id, NormalizedBoardData } from "@/types/domain";
import { arrayMove } from "@/lib/array";

export function moveList(data: NormalizedBoardData, fromIndex: number, toIndex: number): NormalizedBoardData {
  return {
    ...data,
    board: {
      ...data.board,
      listOrder: arrayMove(data.board.listOrder, fromIndex, toIndex)
    }
  };
}

export function reorderCardsInList(
  data: NormalizedBoardData,
  listId: Id,
  fromIndex: number,
  toIndex: number
): NormalizedBoardData {
  const list = data.lists[listId];
  return {
    ...data,
    lists: {
      ...data.lists,
      [listId]: { ...list, cardOrder: arrayMove(list.cardOrder, fromIndex, toIndex) }
    }
  };
}

export function moveCardBetweenLists(
  data: NormalizedBoardData,
  fromListId: Id,
  toListId: Id,
  cardId: Id,
  toIndex: number
): NormalizedBoardData {
  const fromList = data.lists[fromListId];
  const toList = data.lists[toListId];

  const fromOrder = fromList.cardOrder.filter((id) => id !== cardId);
  const nextToOrder = toList.cardOrder.slice();
  const safeIndex = Math.max(0, Math.min(toIndex, nextToOrder.length));
  nextToOrder.splice(safeIndex, 0, cardId);

  return {
    ...data,
    lists: {
      ...data.lists,
      [fromListId]: { ...fromList, cardOrder: fromOrder },
      [toListId]: { ...toList, cardOrder: nextToOrder }
    }
  };
}

export function findListIdByCardId(data: NormalizedBoardData, cardId: Id): Id | null {
  for (const listId of data.board.listOrder) {
    const list = data.lists[listId];
    if (list?.cardOrder.includes(cardId)) return listId;
  }
  return null;
}
