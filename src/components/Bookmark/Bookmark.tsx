import cn from 'clsx';
import { Component, createMemo } from 'solid-js';
import styles from './Bookmark.module.scss';
import { useStore } from '../../store/store';
import type { Bookmark as BookmarkType } from '../../types';
import { getBookmarkCoordinatesByPosition, TILE_SIZE } from '../../utils/position';
import { openContextMenu } from '../ContextMenu/ContextMenu';
import { useDragging } from '../../hooks/useDragging';
import { getFaviconURL } from '../../utils/favicon';

const Bookmark: Component<{
  bookmarkId: string;
}> = (props) => {
  const {
    state,
    actions: { updateBookmarkPosition, setEditingBookmark, removeBookmark },
  } = useStore();

  const bookmark = createMemo(() => {
    return state.bookmarks.find(
      (i) => i.id === props.bookmarkId,
    ) as BookmarkType;
  });

  const {
    isDragging,
    isVisuallyDragging,
    dragOffset,
    afterDragPosition,
    handleMouseDown
  } = useDragging(
    () => bookmark().position,
    (newPosition) => updateBookmarkPosition(bookmark().id, newPosition)
  );

  const faviconImgSrc = createMemo(() => getFaviconURL(bookmark().url));

  const bookmarkStyle = () => {
    const tileCoordinates = getBookmarkCoordinatesByPosition(
      bookmark().position,
    );
    return {
      left: `${tileCoordinates[0] - dragOffset()[0]}px`,
      top: `${tileCoordinates[1] - dragOffset()[1]}px`,
      'z-index': isDragging() ? 10 : 0,
    };
  };

  const dragToStyle = () => {
    if (!isVisuallyDragging()) return {};
    
    const coordinates = getBookmarkCoordinatesByPosition(afterDragPosition());
    return {
      display: 'block',
      left: `${coordinates[0]}px`,
      top: `${coordinates[1]}px`,
      'z-index': 5,
    };
  };

  const handleContextMenu = (e: MouseEvent) => {
    openContextMenu(e, [
      {
        title: chrome.i18n.getMessage("edit"),
        onClick: () => setEditingBookmark(bookmark().id),
      },
      {
        title: chrome.i18n.getMessage("delete"),
        onClick: () => removeBookmark(bookmark().id),
      },
    ]);
    e.stopPropagation();
    e.preventDefault();
  };

  const handleClick = (e: MouseEvent) => {
    if (isVisuallyDragging()) {
      e.preventDefault();
    }
  };

  return (
    <>
      <a
        class={cn(styles.tile, { [styles.dragging]: isVisuallyDragging() })}
        href={bookmark().url}
        style={bookmarkStyle()}
        draggable={false}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
      >
        <div class={styles.iconContainer}>
          {faviconImgSrc() ? (
            <img src={faviconImgSrc()} alt="" />
          ) : (
            <span>?</span>
          )}
        </div>
        <div class={styles.title}>
          <span>{bookmark().title}</span>
        </div>
      </a>
      <div class={styles.dragToArea} style={dragToStyle()} />
    </>
  );
};

export default Bookmark;