import { nanoid } from 'nanoid';
import {
  ParentComponent,
  createContext,
  createEffect,
  useContext,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { Bookmark, Position } from '../types';
import { initActions } from './actions';
import { initSelectors } from './selectors';

export type StoreContextValue = {
  state: StoreContextState;
  actions: ReturnType<typeof initActions>;
  selectors: ReturnType<typeof initSelectors>;
};

export type StoreContextState = {
  bookmarks: Bookmark[];
  editingBookmark: string | 'new' | null;
  newBookmarkPosition: Position;
};

export const defaultState: StoreContextState = {
  bookmarks: [],
  editingBookmark: null,
  newBookmarkPosition: [0, 0],
};

const StoreContext = createContext<StoreContextValue>();

export const StoreProvider: ParentComponent<{
  initialState: Partial<StoreContextState>;
}> = (props) => {
  const [state, setState] = createStore({
    ...defaultState,
    ...props.initialState,
  });

  const selectors = initSelectors({ state });
  const actions = initActions({ state, setState, selectors });

  createEffect(() => {
    if (state.bookmarks && chrome.storage && chrome.storage.sync) {
      // Strip heavy fields (iconDataUrl) before syncing
      const bookmarksToSync = state.bookmarks.map((b) => {
        const { iconDataUrl, ...rest } = b as Bookmark & { iconDataUrl?: string };
        return rest;
      });

      const payload = { bookmarks: JSON.stringify(bookmarksToSync) } as const;
      chrome.storage.sync.set(payload, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          // eslint-disable-next-line no-console
          console.warn('Failed to sync bookmarks:', chrome.runtime.lastError.message);
        }
      });
    }
  });

  return (
    <StoreContext.Provider
      value={{
        state,
        actions,
        selectors,
      }}
    >
      {props.children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext) as StoreContextValue;
