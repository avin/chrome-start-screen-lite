import cn from 'clsx';
import { Component, createMemo, createSignal, onMount } from 'solid-js';
import styles from './Bookmark.module.scss';
import { useStore } from '../../store/store';
import type { Bookmark as BookmarkType } from '../../types';
import { getBookmarkCoordinatesByPosition, TILE_SIZE } from '../../utils/position';
import { openContextMenu } from '../ContextMenu/ContextMenu';
import { useDragging } from '../../hooks/useDragging';
import { getChromeFaviconUrl, getGoogleFaviconUrl, isChrome } from '../../utils/favicon';

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

  const [currentFaviconUrl, setCurrentFaviconUrl] = createSignal<string | undefined>(undefined);

  onMount(() => {
    const currentBookmark = bookmark();
    
    if (currentBookmark.iconDataUrl) {
      setCurrentFaviconUrl(currentBookmark.iconDataUrl);
      return;
    }

    if (isChrome()) {
      const chromeUrl = getChromeFaviconUrl(currentBookmark.url);
      if (chromeUrl) {
        setCurrentFaviconUrl(chromeUrl);
      }
    } else {
      const googleUrl = getGoogleFaviconUrl(currentBookmark.url);
      setCurrentFaviconUrl(googleUrl);
    }
  });

  const handleGoogleFaviconLoad = (e: Event) => {
    const img = e.target as HTMLImageElement;
    if (img.naturalWidth > 16 && img.naturalHeight > 16) {
      const googleUrl = getGoogleFaviconUrl(bookmark().url);
      setCurrentFaviconUrl(googleUrl);
    }
  };

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
          {currentFaviconUrl() ? (
            <>
              <img src={currentFaviconUrl()} alt="" />
              {isChrome() && !bookmark().iconDataUrl && (
                <img 
                  src={getGoogleFaviconUrl(bookmark().url)} 
                  alt=""
                  style={{ display: 'none' }}
                  onLoad={handleGoogleFaviconLoad}
                  onError={() => {}}
                />
              )}
            </>
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