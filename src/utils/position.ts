import { Position } from '../types';

export const TILE_SIZE = 112;

export const getBookmarkCoordinatesByPosition = (position: Position) => {
  return [
    position[0] * TILE_SIZE - TILE_SIZE / 2,
    position[1] * TILE_SIZE - TILE_SIZE / 2,
  ];
};

export const getBookmarkPositionByCoordinates = (
  coordinates: Position,
  pageCenterCoordinates: Position,
): Position => {

  const offsetCoordinates = [
    coordinates[0] - pageCenterCoordinates[0],
    coordinates[1] - pageCenterCoordinates[1]
  ]
  return [
    Math.round(offsetCoordinates[0] / TILE_SIZE),
    Math.round(offsetCoordinates[1] / TILE_SIZE),
  ];
};

export const getBookmarkPositionAfterDrag = (
  startPosition: Position,
  dragOffset: Position,
): Position => {
  const startCoordinates = getBookmarkCoordinatesByPosition(startPosition);
  const afterDragCoordinates = [
    startCoordinates[0] - dragOffset[0],
    startCoordinates[1] - dragOffset[1],
  ];
  const diff = [
    afterDragCoordinates[0] - startCoordinates[0],
    afterDragCoordinates[1] - startCoordinates[1],
  ];
  return [
    Math.round(diff[0] / TILE_SIZE) + startPosition[0],
    Math.round(diff[1] / TILE_SIZE) + startPosition[1],
  ];
};
