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
    // Remove associated icon from local storage
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove(`icon:${bookmarkId}`, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          // eslint-disable-next-line no-console
          console.warn('Failed to remove icon from local:', chrome.runtime.lastError.message);
        }
      });
    }
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
    // Persist icon changes in local storage separately
    // Detect explicit presence of the field, even if value is undefined
    const iconFieldPresent = Object.prototype.hasOwnProperty.call(
      newBookmarkOptions,
      'iconDataUrl',
    );
    if (iconFieldPresent && chrome.storage && chrome.storage.local) {
      const key = `icon:${bookmarkId}`;
      if (newBookmarkOptions.iconDataUrl) {
        chrome.storage.local.set({ [key]: newBookmarkOptions.iconDataUrl }, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            // eslint-disable-next-line no-console
            console.warn('Failed to save icon to local:', chrome.runtime.lastError.message);
          }
        });
      } else {
        chrome.storage.local.remove(key, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            // eslint-disable-next-line no-console
            console.warn('Failed to remove icon from local:', chrome.runtime.lastError.message);
          }
        });
      }
    }

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
    const id = nanoid();

    // Save icon to local storage if provided
    if (newBookmarkOptions.iconDataUrl && chrome.storage && chrome.storage.local) {
      const key = `icon:${id}`;
      chrome.storage.local.set({ [key]: newBookmarkOptions.iconDataUrl }, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          // eslint-disable-next-line no-console
          console.warn('Failed to save icon to local:', chrome.runtime.lastError.message);
        }
      });
    }

    setState(
      produce((store) => {
        store.bookmarks.push({
          id,
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
