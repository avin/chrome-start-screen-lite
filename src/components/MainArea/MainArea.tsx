import { Component, For, createEffect, createSignal, onMount, onCleanup } from 'solid-js';
import styles from './MainArea.module.scss';
import { useStore } from '../../store/store';
import { Position } from '../../types';
import { getBookmarkPositionByCoordinates } from '../../utils/position';
import { calculateLayout } from '../../utils/layout';
import Bookmark from '../Bookmark/Bookmark';
import { openContextMenu } from '../ContextMenu/ContextMenu';

const RESIZE_DEBOUNCE_MS = 100;

const MainArea: Component = () => {
  const {
    state,
    actions: { setEditingBookmark, setNewBookmarkPosition },
  } = useStore();

  const [centerOffset, setCenterOffset] = createSignal<Position>([0, 0]);
  const [scale, setScale] = createSignal(1);

  const adjustLayout = () => {
    const positions = state.bookmarks.map(b => b.position);
    const { offset, scale: newScale } = calculateLayout(positions);
    
    setScale(newScale);
    setCenterOffset(offset);
  };

  let resizeTimer: number;
  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(adjustLayout, RESIZE_DEBOUNCE_MS);
  };

  const handleContextMenu = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.width / 2 - centerOffset()[0];
    const centerY = rect.height / 2 - centerOffset()[1];
    
    openContextMenu(e, [
      {
        title: chrome.i18n.getMessage("addShortcut"),
        onClick: () => {
          const position = getBookmarkPositionByCoordinates(
            [(e.clientX - centerX) / scale(), (e.clientY - centerY) / scale()] as Position,
            [0, 0] as Position,
          );
          setNewBookmarkPosition(position);
          setEditingBookmark('new');
        },
      },
    ]);
    e.preventDefault();
  };

  onMount(() => {
    adjustLayout();
    window.addEventListener('resize', handleResize);
  });

  onCleanup(() => {
    window.removeEventListener('resize', handleResize);
  });

  createEffect(() => {
    state.bookmarks;
    adjustLayout();
  });

  return (
    <div
      class={styles.container}
      onContextMenu={handleContextMenu}
    >
      <div 
        class={styles.center}
        data-bookmark-container
        style={{
          transform: `translate(${centerOffset()[0]}px, ${centerOffset()[1]}px) scale(${scale()})`,
          'transform-origin': 'center'
        }}
      >
        <For each={state.bookmarks}>
          {(bookmark) => <Bookmark bookmarkId={bookmark.id} />}
        </For>
      </div>
    </div>
  );
};

export default MainArea;