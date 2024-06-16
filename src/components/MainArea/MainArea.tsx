import { Component, For } from 'solid-js';
import styles from './MainArea.module.scss';
import { useStore } from '../../store/store';
import { Position } from '../../types';
import { getBookmarkPositionByCoordinates } from '../../utils/position';
import Bookmark from '../Bookmark/Bookmark';
import { openContextMenu } from '../ContextMenu/ContextMenu';

const MainArea: Component = () => {
  const {
    state,
    actions: { setEditingBookmark, setNewBookmarkPosition },
  } = useStore();

  return (
    <div
      class={styles.container}
      onContextMenu={(e) => {
        openContextMenu(e, [
          {
            title: chrome.i18n.getMessage("addShortcut"),
            onClick: () => {
              setNewBookmarkPosition(
                getBookmarkPositionByCoordinates(
                  [e.clientX, e.clientY] as Position,
                  [
                    (e.target as HTMLDivElement).offsetWidth / 2,
                    (e.target as HTMLDivElement).offsetHeight / 2,
                  ] as Position,
                ),
              );
              setEditingBookmark('new');
            },
          },
        ]);
        e.preventDefault();
      }}
    >
      <div class={styles.center}>
        <For each={state.bookmarks}>
          {(bookmark, i) => <Bookmark bookmarkId={bookmark.id} />}
        </For>
      </div>
    </div>
  );
};

export default MainArea;
