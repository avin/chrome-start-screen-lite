import { nanoid } from 'nanoid';
import { SetStoreFunction, produce } from 'solid-js/store';
import { Bookmark, Position } from '../types';
import { initSelectors } from './selectors';
import { StoreContextState } from './store';

export const initActions = ({
  state,
  setState,
}: {
  state: StoreContextState;
  setState: SetStoreFunction<StoreContextState>;
  selectors: ReturnType<typeof initSelectors>;
}) => {
  const updateBookmarkPosition = (
    bookmarkId: string,
    newPosition: Position,
  ) => {
    setState(
      produce((store) => {
        const bookmark = store.bookmarks.find(
          (i) => i.id === bookmarkId,
        ) as Bookmark;

        const prevPosition: Position = bookmark.position;

        const overlappingBookmark = store.bookmarks.find(
          (i) =>
            i.position[0] === newPosition[0] &&
            i.position[1] === newPosition[1],
        );
        if (overlappingBookmark) {
          overlappingBookmark.position = prevPosition;
        }

        bookmark.position = newPosition;
      }),
    );
  };

  const setEditingBookmark = (bookmarkId: string | 'new' | null) => {
    setState(
      produce((store) => {
        store.editingBookmark = bookmarkId;
      }),
    );
  };

  const removeBookmark = (bookmarkId: string) => {
    setState(
      produce((store) => {
        store.bookmarks = store.bookmarks.filter((i) => i.id !== bookmarkId);
      }),
    );
  };

  const updateBookmark = (
    bookmarkId: string,
    newBookmarkOptions: Partial<Bookmark>,
  ) => {
    setState(
      produce((store) => {
        const bookmark = store.bookmarks.find((i) => i.id === bookmarkId);
        if (bookmark) {
          Object.assign(bookmark, newBookmarkOptions);
        }
      }),
    );
  };

  const createBookmark = (newBookmarkOptions: Omit<Bookmark, 'id'>) => {
    setState(
      produce((store) => {
        store.bookmarks.push({
          id: nanoid(),
          ...newBookmarkOptions,
        });
      }),
    );
  };

  const setNewBookmarkPosition = (position: Position) => {
    setState(
      produce((store) => {
        store.newBookmarkPosition = position;
      }),
    );
  };

  return {
    updateBookmarkPosition,
    setEditingBookmark,
    removeBookmark,
    createBookmark,
    updateBookmark,
    setNewBookmarkPosition,
  };
};
