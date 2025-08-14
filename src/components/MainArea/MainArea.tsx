import { Component, For, createEffect, createSignal, onMount, onCleanup } from 'solid-js';
import styles from './MainArea.module.scss';
import { useStore } from '../../store/store';
import { Position } from '../../types';
import { getBookmarkPositionByCoordinates, TILE_SIZE } from '../../utils/position';
import Bookmark from '../Bookmark/Bookmark';
import { openContextMenu } from '../ContextMenu/ContextMenu';

const MainArea: Component = () => {
  const {
    state,
    actions: { setEditingBookmark, setNewBookmarkPosition },
  } = useStore();

  const [centerOffset, setCenterOffset] = createSignal<Position>([0, 0]);
  const [scale, setScale] = createSignal(1);

  const adjustLayout = () => {
    if (state.bookmarks.length === 0) {
      setCenterOffset([0, 0]);
      setScale(1);
      return;
    }
    
    const positions = state.bookmarks.map(b => b.position);
    const bounds = {
      minX: Math.min(...positions.map(p => p[0])),
      maxX: Math.max(...positions.map(p => p[0])),
      minY: Math.min(...positions.map(p => p[1])),
      maxY: Math.max(...positions.map(p => p[1]))
    };
    
    const tileSize = TILE_SIZE;
    const padding = tileSize / 2;
    
    const leftEdge = bounds.minX * tileSize - padding;
    const rightEdge = bounds.maxX * tileSize + padding;
    const topEdge = bounds.minY * tileSize - padding;
    const bottomEdge = bounds.maxY * tileSize + padding;
    
    const contentWidth = rightEdge - leftEdge;
    const contentHeight = bottomEdge - topEdge;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const halfViewportWidth = viewportWidth / 2;
    const halfViewportHeight = viewportHeight / 2;
    
    let offsetX = 0;
    let offsetY = 0;
    let newScale = 1;
    
    // First try to fit with offset adjustment only (scale = 1)
    if (-leftEdge > halfViewportWidth) {
      offsetX = Math.max(0, -halfViewportWidth - leftEdge);
    } else if (rightEdge > halfViewportWidth) {
      offsetX = Math.min(0, halfViewportWidth - rightEdge);
    }
    
    if (-topEdge > halfViewportHeight) {
      offsetY = Math.max(0, -halfViewportHeight - topEdge);
    } else if (bottomEdge > halfViewportHeight) {
      offsetY = Math.min(0, halfViewportHeight - bottomEdge);
    }
    
    // Check if content fits after offset adjustment
    const adjustedLeftEdge = leftEdge + offsetX;
    const adjustedRightEdge = rightEdge + offsetX;
    const adjustedTopEdge = topEdge + offsetY;
    const adjustedBottomEdge = bottomEdge + offsetY;
    
    const needsScaling = 
      Math.abs(adjustedLeftEdge) > halfViewportWidth ||
      adjustedRightEdge > halfViewportWidth ||
      Math.abs(adjustedTopEdge) > halfViewportHeight ||
      adjustedBottomEdge > halfViewportHeight;
    
    if (needsScaling) {
      // Calculate scale to fit
      const scaleX = viewportWidth / contentWidth;
      const scaleY = viewportHeight / contentHeight;
      newScale = Math.min(1, Math.min(scaleX, scaleY)) * 0.9;
      
      // When scaling from center (0,0), the edges scale proportionally
      // So we need to recalculate where the scaled edges will be
      const scaledWidth = contentWidth * newScale;
      const scaledHeight = contentHeight * newScale;
      
      // Calculate the center of the content in original coordinates
      const contentCenterX = (leftEdge + rightEdge) / 2;
      const contentCenterY = (topEdge + bottomEdge) / 2;
      
      // After scaling from (0,0), the content center will be at:
      const scaledCenterX = contentCenterX * newScale;
      const scaledCenterY = contentCenterY * newScale;
      
      // Calculate scaled edges based on scaled center and scaled dimensions
      const scaledLeftEdge = scaledCenterX - scaledWidth / 2;
      const scaledRightEdge = scaledCenterX + scaledWidth / 2;
      const scaledTopEdge = scaledCenterY - scaledHeight / 2;
      const scaledBottomEdge = scaledCenterY + scaledHeight / 2;
      
      // Now calculate offset to fit scaled content in viewport
      offsetX = 0;
      offsetY = 0;
      
      if (-scaledLeftEdge > halfViewportWidth) {
        offsetX = -halfViewportWidth - scaledLeftEdge;
      } else if (scaledRightEdge > halfViewportWidth) {
        offsetX = halfViewportWidth - scaledRightEdge;
      }
      
      if (-scaledTopEdge > halfViewportHeight) {
        offsetY = -halfViewportHeight - scaledTopEdge;
      } else if (scaledBottomEdge > halfViewportHeight) {
        offsetY = halfViewportHeight - scaledBottomEdge;
      }
    }
    
    setScale(newScale);
    setCenterOffset([offsetX, offsetY]);
  };

  let resizeTimer: number;
  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(adjustLayout, 100);
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
      onContextMenu={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const centerX = rect.width / 2 - centerOffset()[0];
        const centerY = rect.height / 2 - centerOffset()[1];
        
        openContextMenu(e, [
          {
            title: chrome.i18n.getMessage("addShortcut"),
            onClick: () => {
              setNewBookmarkPosition(
                getBookmarkPositionByCoordinates(
                  [(e.clientX - centerX) / scale(), (e.clientY - centerY) / scale()] as Position,
                  [0, 0] as Position,
                ),
              );
              setEditingBookmark('new');
            },
          },
        ]);
        e.preventDefault();
      }}
    >
      <div 
        class={styles.center}
        style={{
          transform: `translate(${centerOffset()[0]}px, ${centerOffset()[1]}px) scale(${scale()})`,
          'transform-origin': 'center'
        }}
      >
        <For each={state.bookmarks}>
          {(bookmark, i) => <Bookmark bookmarkId={bookmark.id} />}
        </For>
      </div>
    </div>
  );
};

export default MainArea;