import { Bookmark } from '../types';

export const BOOKMARKS_STORAGE_KEY = 'bookmarks';

type StoredBookmark = Omit<Bookmark, 'iconDataUrl'>;

type StoredBookmarksResult = {
  exists: boolean;
  bookmarks: StoredBookmark[] | null;
};

function getFromStorage(
  area: chrome.storage.StorageArea | undefined,
  keys: string[],
  errorMessage: string,
): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    if (!area) {
      resolve({});
      return;
    }

    area.get(keys, (data) => {
      if (chrome.runtime && chrome.runtime.lastError) {
        console.warn(errorMessage, chrome.runtime.lastError.message);
        resolve({});
        return;
      }

      resolve(data as Record<string, unknown>);
    });
  });
}

function setInStorage(
  area: chrome.storage.StorageArea | undefined,
  items: Record<string, string>,
  errorMessage: string,
): Promise<void> {
  return new Promise((resolve) => {
    if (!area) {
      resolve();
      return;
    }

    area.set(items, () => {
      if (chrome.runtime && chrome.runtime.lastError) {
        console.warn(errorMessage, chrome.runtime.lastError.message);
      }

      resolve();
    });
  });
}

function removeFromStorage(
  area: chrome.storage.StorageArea | undefined,
  keys: string[],
  errorMessage: string,
): Promise<void> {
  return new Promise((resolve) => {
    if (!area) {
      resolve();
      return;
    }

    area.remove(keys, () => {
      if (chrome.runtime && chrome.runtime.lastError) {
        console.warn(errorMessage, chrome.runtime.lastError.message);
      }

      resolve();
    });
  });
}

function serializeBookmarks(bookmarks: Bookmark[]): string {
  return JSON.stringify(
    bookmarks.map((bookmark) => {
      const { iconDataUrl, ...rest } = bookmark;
      return rest;
    }),
  );
}

function parseBookmarks(rawValue: unknown, source: string): StoredBookmark[] | null {
  if (typeof rawValue !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? (parsed as StoredBookmark[]) : null;
  } catch (error) {
    console.warn(`Failed to parse bookmarks from ${source}:`, error);
    return null;
  }
}

async function getStoredBookmarks(
  area: chrome.storage.StorageArea | undefined,
  source: string,
): Promise<StoredBookmarksResult> {
  const data = await getFromStorage(
    area,
    [BOOKMARKS_STORAGE_KEY],
    `Failed to read bookmarks from ${source}:`,
  );

  const exists = Object.prototype.hasOwnProperty.call(data, BOOKMARKS_STORAGE_KEY);
  const bookmarks = exists ? parseBookmarks(data[BOOKMARKS_STORAGE_KEY], source) : null;

  return { exists, bookmarks };
}

async function mergeIconsFromLocal(bookmarks: StoredBookmark[]): Promise<Bookmark[]> {
  if (!chrome.storage || !chrome.storage.local || bookmarks.length === 0) {
    return bookmarks;
  }

  const iconKeys = bookmarks.map((bookmark) => `icon:${bookmark.id}`);
  const icons = await getFromStorage(
    chrome.storage.local,
    iconKeys,
    'Failed to read icons from local:',
  );

  return bookmarks.map((bookmark) => {
    const iconDataUrl = icons[`icon:${bookmark.id}`];
    return typeof iconDataUrl === 'string'
      ? { ...bookmark, iconDataUrl }
      : bookmark;
  });
}

export async function saveBookmarksToLocal(bookmarks: Bookmark[]): Promise<void> {
  if (!chrome.storage || !chrome.storage.local) {
    return;
  }

  await setInStorage(
    chrome.storage.local,
    { [BOOKMARKS_STORAGE_KEY]: serializeBookmarks(bookmarks) },
    'Failed to save bookmarks to local:',
  );
}

async function clearLegacySyncBookmarks(): Promise<void> {
  if (!chrome.storage || !chrome.storage.sync) {
    return;
  }

  await removeFromStorage(
    chrome.storage.sync,
    [BOOKMARKS_STORAGE_KEY],
    'Failed to clear bookmarks from sync:',
  );
}

export async function loadBookmarksFromStorage(
  fallbackBookmarks: Bookmark[],
): Promise<Bookmark[]> {
  if (!chrome.storage || !chrome.storage.local) {
    return fallbackBookmarks;
  }

  const localBookmarks = await getStoredBookmarks(chrome.storage.local, 'local');
  if (localBookmarks.exists) {
    return mergeIconsFromLocal(localBookmarks.bookmarks ?? fallbackBookmarks);
  }

  if (chrome.storage && chrome.storage.sync) {
    const syncBookmarks = await getStoredBookmarks(chrome.storage.sync, 'sync');
    if (syncBookmarks.bookmarks) {
      await saveBookmarksToLocal(syncBookmarks.bookmarks);
      await clearLegacySyncBookmarks();
      return mergeIconsFromLocal(syncBookmarks.bookmarks);
    }
  }

  return mergeIconsFromLocal(fallbackBookmarks);
}
