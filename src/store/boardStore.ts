import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Comment, Id, NormalizedBoardData } from "@/types/domain";
import { loadFromStorage, saveToStorage } from "@/services/storage";
import { debounce } from "@/services/debounce";
import {
  findListIdByCardId,
  moveCardBetweenLists,
  moveList,
  reorderCardsInList,
} from "@/lib/board";

type BoardStoreState = {
  data: NormalizedBoardData;
  hydrated: boolean;

  commentsModal: { open: boolean; cardId: Id | null };

  hydrate: () => void;

  updateBoardTitle: (title: string) => void;

  addList: (title?: string) => void;
  deleteList: (listId: Id) => void;
  deleteAllCardsInList: (listId: Id) => void;
  updateListTitle: (listId: Id, title: string) => void;
  moveListByIndex: (fromIndex: number, toIndex: number) => void;

  addCard: (listId: Id, title?: string) => void;
  updateCardTitle: (cardId: Id, title: string) => void;
  moveCard: (cardId: Id, toListId: Id, toIndex: number) => void;
  reorderCards: (listId: Id, fromIndex: number, toIndex: number) => void;

  openComments: (cardId: Id) => void;
  closeComments: () => void;
  addComment: (cardId: Id, text: string) => void;
};

const DEFAULT_DATA: NormalizedBoardData = (() => {
  const boardId = "board_demo";

  const list1: Id = "list_todo";
  const list2: Id = "list_wip";
  const list3: Id = "list_done";

  const c1: Id = "card_1";
  const c2: Id = "card_2";
  const c3: Id = "card_3";
  const c4: Id = "card_4";
  const c5: Id = "card_5";
  const c6: Id = "card_6";
  const c7: Id = "card_7";

  return {
    board: {
      id: boardId,
      title: "Demo Board",
      listOrder: [list1, list2, list3],
    },
    lists: {
      [list1]: { id: list1, title: "Pending", cardOrder: [c1, c2] },
      [list2]: {
        id: list2,
        title: "Work In Progress",
        cardOrder: [c3, c4, c5],
      },
      [list3]: { id: list3, title: "Done", cardOrder: [c6, c7] },
    },
    cards: {
      [c1]: { id: c1, title: "Creating cards are easy!", comments: [] },
      [c2]: { id: c2, title: "Styling card areas", comments: [] },
      [c3]: { id: c3, title: "Styling of icon", comments: [] },
      [c4]: { id: c4, title: "Creating store and reducers", comments: [] },
      [c5]: { id: c5, title: "Setup Project Structure", comments: [] },
      [c6]: { id: c6, title: "Improve Card UI", comments: [] },
      [c7]: { id: c7, title: "Responsive Board Design", comments: [] },
    },
  };
})();

const persist = debounce(
  (data: NormalizedBoardData) => saveToStorage(data),
  150
);

function setAndPersist(
  set: (fn: (s: BoardStoreState) => Partial<BoardStoreState>) => void,
  nextData: NormalizedBoardData
) {
  set(() => ({ data: nextData }));
  persist(nextData);
}

export const useBoardStore = create<BoardStoreState>((set, get) => ({
  data: DEFAULT_DATA,
  hydrated: false,
  commentsModal: { open: false, cardId: null },

  hydrate: () => {
    const fromStorage = loadFromStorage();
    const next = fromStorage ?? DEFAULT_DATA;

    set(() => ({
      data: next,
      hydrated: true,
    }));

    if (!fromStorage) {
      saveToStorage(next);
    }
  },

  updateBoardTitle: (title) => {
    const { data } = get();
    setAndPersist(set, {
      ...data,
      board: { ...data.board, title: title.trim() || "Untitled Board" },
    });
  },

  addList: (title = "Untitled List") => {
    const { data } = get();
    const id = `list_${nanoid(8)}`;
    const nextData: NormalizedBoardData = {
      ...data,
      board: { ...data.board, listOrder: [...data.board.listOrder, id] },
      lists: {
        ...data.lists,
        [id]: { id, title, cardOrder: [] },
      },
    };
    setAndPersist(set, nextData);
  },

  deleteList: (listId) => {
    const { data } = get();
    const list = data.lists[listId];
    if (!list) return;

    const nextLists = { ...data.lists };
    delete nextLists[listId];

    const nextCards = { ...data.cards };
    for (const cid of list.cardOrder) delete nextCards[cid];

    const nextOrder = data.board.listOrder.filter((id) => id !== listId);

    const nextData: NormalizedBoardData = {
      ...data,
      board: { ...data.board, listOrder: nextOrder },
      lists: nextLists,
      cards: nextCards,
    };

    const modal = get().commentsModal;
    const shouldClose =
      modal.open && modal.cardId && list.cardOrder.includes(modal.cardId);

    set(() => ({
      data: nextData,
      commentsModal: shouldClose ? { open: false, cardId: null } : modal,
    }));
    persist(nextData);
  },

  deleteAllCardsInList: (listId) => {
    const { data } = get();
    const list = data.lists[listId];
    if (!list) return;

    if (list.cardOrder.length === 0) return;

    const nextCards = { ...data.cards };
    for (const cid of list.cardOrder) delete nextCards[cid];

    const nextData: NormalizedBoardData = {
      ...data,
      lists: {
        ...data.lists,
        [listId]: { ...list, cardOrder: [] },
      },
      cards: nextCards,
    };

    const modal = get().commentsModal;
    const shouldClose =
      modal.open && modal.cardId && list.cardOrder.includes(modal.cardId);

    set(() => ({
      data: nextData,
      commentsModal: shouldClose ? { open: false, cardId: null } : modal,
    }));
    persist(nextData);
  },

  updateListTitle: (listId, title) => {
    const { data } = get();
    const list = data.lists[listId];
    if (!list) return;

    const nextData: NormalizedBoardData = {
      ...data,
      lists: {
        ...data.lists,
        [listId]: { ...list, title: title.trim() || "Untitled List" },
      },
    };

    setAndPersist(set, nextData);
  },

  moveListByIndex: (fromIndex, toIndex) => {
    const { data } = get();
    if (fromIndex === toIndex) return;
    setAndPersist(set, moveList(data, fromIndex, toIndex));
  },

  addCard: (listId, title = "New card") => {
    const { data } = get();
    const list = data.lists[listId];
    if (!list) return;

    const cardId = `card_${nanoid(10)}`;
    const nextData: NormalizedBoardData = {
      ...data,
      lists: {
        ...data.lists,
        [listId]: { ...list, cardOrder: [...list.cardOrder, cardId] },
      },
      cards: {
        ...data.cards,
        [cardId]: { id: cardId, title, comments: [] },
      },
    };

    setAndPersist(set, nextData);
  },

  updateCardTitle: (cardId, title) => {
    const { data } = get();
    const card = data.cards[cardId];
    if (!card) return;

    const nextData: NormalizedBoardData = {
      ...data,
      cards: {
        ...data.cards,
        [cardId]: { ...card, title: title.trim() || "Untitled Card" },
      },
    };

    setAndPersist(set, nextData);
  },

  moveCard: (cardId, toListId, toIndex) => {
    const { data } = get();
    const fromListId = findListIdByCardId(data, cardId);
    if (!fromListId) return;
    if (!data.lists[toListId]) return;

    const nextData = moveCardBetweenLists(
      data,
      fromListId,
      toListId,
      cardId,
      toIndex
    );
    setAndPersist(set, nextData);
  },

  reorderCards: (listId, fromIndex, toIndex) => {
    const { data } = get();
    if (!data.lists[listId]) return;
    if (fromIndex === toIndex) return;
    setAndPersist(set, reorderCardsInList(data, listId, fromIndex, toIndex));
  },

  openComments: (cardId) => {
    set(() => ({ commentsModal: { open: true, cardId } }));
  },

  closeComments: () => {
    set(() => ({ commentsModal: { open: false, cardId: null } }));
  },

  addComment: (cardId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const { data } = get();
    const card = data.cards[cardId];
    if (!card) return;

    const comment: Comment = {
      id: `c_${nanoid(10)}`,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    const nextData: NormalizedBoardData = {
      ...data,
      cards: {
        ...data.cards,
        [cardId]: { ...card, comments: [...card.comments, comment] },
      },
    };

    setAndPersist(set, nextData);
  },
}));
