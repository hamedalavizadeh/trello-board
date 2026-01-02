export type Id = string;

export interface Comment {
  id: Id;
  text: string;
  createdAt: string; // ISO
}

export interface Card {
  id: Id;
  title: string;
  comments: Comment[];
}

export interface List {
  id: Id;
  title: string;
  cardOrder: Id[];
}

export interface Board {
  id: Id;
  title: string;
  listOrder: Id[];
}

export interface NormalizedBoardData {
  board: Board;
  lists: Record<Id, List>;
  cards: Record<Id, Card>;
}
