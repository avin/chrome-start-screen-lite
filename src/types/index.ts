export type Position = [number, number];

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  position: Position
  iconDataUrl?: string;
}
