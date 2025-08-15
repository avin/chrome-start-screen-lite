import { Position } from '../types';
import { TILE_SIZE } from './position';

const PADDING_RATIO = 0.5;

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
interface LayoutResult {
  offset: Position;
  scale: number;
}
export function calculateLayout(bookmarkPositions: Position[]): LayoutResult {
  if (bookmarkPositions.length === 0) {
    return { offset: [0, 0], scale: 1 };
  }
 
  const bounds = calculateBounds(bookmarkPositions);
  const edges = calculateEdges(bounds);
  const viewport = getViewportDimensions();
 
  const { offset, needsScaling } = calculateOffset(edges, viewport);
 
  if (!needsScaling) {
    return { offset, scale: 1 };
  }
 
  return calculateScaledLayout(edges, viewport);
}
function calculateBounds(positions: Position[]): Bounds {
  return {
    minX: Math.min(...positions.map(p => p[0])),
    maxX: Math.max(...positions.map(p => p[0])),
    minY: Math.min(...positions.map(p => p[1])),
    maxY: Math.max(...positions.map(p => p[1]))
  };
}
function calculateEdges(bounds: Bounds) {
  const padding = TILE_SIZE * PADDING_RATIO;
 
  return {
    left: bounds.minX * TILE_SIZE - padding,
    right: bounds.maxX * TILE_SIZE + padding,
    top: bounds.minY * TILE_SIZE - padding,
    bottom: bounds.maxY * TILE_SIZE + padding,
    width: 0,
    height: 0
  };
}
function getViewportDimensions() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    halfWidth: window.innerWidth / 2,
    halfHeight: window.innerHeight / 2
  };
}
function calculateOffset(edges: any, viewport: any) {
  let offsetX = 0;
  let offsetY = 0;
 
  if (-edges.left > viewport.halfWidth) {
    offsetX = Math.max(0, -viewport.halfWidth - edges.left);
  } else if (edges.right > viewport.halfWidth) {
    offsetX = Math.min(0, viewport.halfWidth - edges.right);
  }
 
  if (-edges.top > viewport.halfHeight) {
    offsetY = Math.max(0, -viewport.halfHeight - edges.top);
  } else if (edges.bottom > viewport.halfHeight) {
    offsetY = Math.min(0, viewport.halfHeight - edges.bottom);
  }
 
  const adjustedEdges = {
    left: edges.left + offsetX,
    right: edges.right + offsetX,
    top: edges.top + offsetY,
    bottom: edges.bottom + offsetY
  };
 
  const needsScaling =
    Math.abs(adjustedEdges.left) > viewport.halfWidth ||
    adjustedEdges.right > viewport.halfWidth ||
    Math.abs(adjustedEdges.top) > viewport.halfHeight ||
    adjustedEdges.bottom > viewport.halfHeight;
 
  return { offset: [offsetX, offsetY] as Position, needsScaling };
}
function calculateScaledLayout(edges: any, viewport: any): LayoutResult {
  edges.width = edges.right - edges.left;
  edges.height = edges.bottom - edges.top;
 
  const scaleX = viewport.width / edges.width;
  const scaleY = viewport.height / edges.height;
  const scale = Math.min(1, Math.min(scaleX, scaleY));
 
  const contentCenterX = (edges.left + edges.right) / 2;
  const contentCenterY = (edges.top + edges.bottom) / 2;
 
  const offsetX = -scale * contentCenterX;
  const offsetY = -scale * contentCenterY;
 
  return { offset: [offsetX, offsetY], scale };
}