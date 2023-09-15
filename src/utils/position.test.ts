import { expect, test } from 'vitest';
import { getBookmarkPositionByCoordinates } from './position';

test('getBookmarkPositionByCoordinates', () => {
  expect(
    JSON.stringify(getBookmarkPositionByCoordinates([500, 500], [500, 500])),
  ).toBe(JSON.stringify([0, 0]));

  expect(
    JSON.stringify(
      getBookmarkPositionByCoordinates([500 - 10, 500], [500, 500]),
    ),
  ).toBe(JSON.stringify([0, 0]));

  expect(
    JSON.stringify(
      getBookmarkPositionByCoordinates([500 - 100, 500], [500, 500]),
    ),
  ).toBe(JSON.stringify([-1, 0]));

  expect(
    JSON.stringify(
      getBookmarkPositionByCoordinates([500, 500 + 100], [500, 500]),
    ),
  ).toBe(JSON.stringify([0, 1]));
});
