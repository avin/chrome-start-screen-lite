import cn from 'clsx';
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from 'solid-js';
import styles from './Bookmark.module.scss';
import { useStore } from '../../store/store';
import type { Bookmark as BookmarkType } from '../../types';
import { Position } from '../../types';
import {
  getBookmarkCoordinatesByPosition,
  getBookmarkPositionAfterDrag,
  TILE_SIZE,
} from '../../utils/position';
import { openContextMenu } from '../ContextMenu/ContextMenu';

function faviconURL(u: string): string | undefined {
  if (!chrome.runtime) {
    return undefined;
  }
  const url = new URL(chrome.runtime.getURL('/_favicon/'));
  url.searchParams.set('pageUrl', u);
  url.searchParams.set('size', '32');
  return url.toString();
}

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

  const [isDragging, setIsDragging] = createSignal();
  const [isVisuallyDragging, setIsVisuallyDragging] = createSignal();
  const [dragOffset, setDragOffset] = createSignal<Position>([0, 0]);

  let startMousePosition = [0, 0];
  let startScale = 1;

  const faviconImgSrc = createMemo(() => {
    return faviconURL(bookmark().url);
  });

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

  const afterDragPosition = (): Position => {
    return getBookmarkPositionAfterDrag(bookmark().position, dragOffset(), startScale);
  };

  const dragToStyle = () => {
    if (!isVisuallyDragging()) {
      return {};
    }
    const coordinates = getBookmarkCoordinatesByPosition(afterDragPosition());
    return {
      display: 'block',
      left: `${coordinates[0]}px`,
      top: `${coordinates[1]}px`,
      'z-index': 5,
    };
  };

  createEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging()) {
        return;
      }
      
      const container = document.querySelector(`.${styles.tile}`)?.parentElement?.parentElement;
      if (container) {
        const transform = window.getComputedStyle(container.querySelector(`.${styles.tile}`)?.parentElement!).transform;
        const matrixMatch = transform.match(/matrix\(([^,]+),/);
        const currentScale = matrixMatch ? parseFloat(matrixMatch[1]) : 1;
        
        setDragOffset([
          (startMousePosition[0] - e.clientX) / currentScale,
          (startMousePosition[1] - e.clientY) / currentScale,
        ]);
      } else {
        setDragOffset([
          startMousePosition[0] - e.clientX,
          startMousePosition[1] - e.clientY,
        ]);
      }
      
      if (Math.abs(dragOffset()[0]) + Math.abs(dragOffset()[1]) > 10) {
        setIsVisuallyDragging(true);
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging()) {
        return;
      }
      updateBookmarkPosition(bookmark().id, afterDragPosition());

      setIsDragging(false);
      setDragOffset([0, 0]);

      setTimeout(() => {
        setIsVisuallyDragging(false);
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    onCleanup(() => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    });
  });

  return (
    <>
      <a
        class={cn(styles.tile, { [styles.dragging]: isVisuallyDragging() })}
        href={bookmark().url}
        style={bookmarkStyle()}
        draggable={false}
        onClick={(e) => {
          if (isVisuallyDragging()) {
            e.preventDefault();
          }
        }}
        onMouseDown={(e) => {
          const container = (e.currentTarget as HTMLElement).parentElement;
          if (container) {
            const transform = window.getComputedStyle(container).transform;
            const matrixMatch = transform.match(/matrix\(([^,]+),/);
            startScale = matrixMatch ? parseFloat(matrixMatch[1]) : 1;
          }
          startMousePosition = [e.clientX, e.clientY];
          setIsDragging(true);
        }}
        onContextMenu={(e) => {
          openContextMenu(e, [
            {
              title: chrome.i18n.getMessage("edit"),
              onClick: () => {
                setEditingBookmark(bookmark().id);
              },
            },
            {
              title: chrome.i18n.getMessage("delete"),
              onClick: () => {
                removeBookmark(bookmark().id);
              },
            },
          ]);
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <div class={styles.iconContainer}>
          {faviconImgSrc() ? (
            <img src={faviconImgSrc()} alt="?" />
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