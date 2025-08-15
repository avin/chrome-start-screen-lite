import { createSignal, createEffect, onCleanup } from 'solid-js';
import { Position } from '../types';
import { getBookmarkPositionAfterDrag } from '../utils/position';

export function useDragging(
  bookmarkPosition: () => Position,
  onDragEnd: (newPosition: Position) => void
) {
  const [isDragging, setIsDragging] = createSignal(false);
  const [isVisuallyDragging, setIsVisuallyDragging] = createSignal(false);
  const [dragOffset, setDragOffset] = createSignal<Position>([0, 0]);
  
  let startMousePosition = [0, 0];
  let startScale = 1;

  const afterDragPosition = (): Position => {
    return getBookmarkPositionAfterDrag(bookmarkPosition(), dragOffset(), startScale);
  };

  const handleMouseDown = (e: MouseEvent) => {
    const container = (e.currentTarget as HTMLElement).parentElement;
    if (container) {
      const transform = window.getComputedStyle(container).transform;
      const matrixMatch = transform.match(/matrix\(([^,]+),/);
      startScale = matrixMatch ? parseFloat(matrixMatch[1]) : 1;
    }
    startMousePosition = [e.clientX, e.clientY];
    setIsDragging(true);
  };

  createEffect(() => {
    if (!isDragging()) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.querySelector('[data-bookmark-container]');
      if (container) {
        const transform = window.getComputedStyle(container).transform;
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
    
    const handleMouseUp = () => {
      if (!isDragging()) return;
      
      onDragEnd(afterDragPosition());
      setIsDragging(false);
      setDragOffset([0, 0]);
      
      setTimeout(() => setIsVisuallyDragging(false));
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    onCleanup(() => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    });
  });

  return {
    isDragging,
    isVisuallyDragging,
    dragOffset,
    afterDragPosition,
    handleMouseDown
  };
}