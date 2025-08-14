/* @refresh reload */
import { render } from 'solid-js/web';
import './styles/index.scss';
import App from './components/App/App';
import { defaultBookmarks } from './constants/defaultBookmarks';
import { Bookmark } from './types';

document.title = chrome.i18n.getMessage('newTabTitle');

const root = document.getElementById('root');

window.debug_setBookmarks = (bookmarks: string) => {
  chrome.storage.sync.set({ bookmarks: bookmarks });
};
window.debug_dumpBookmarks = () => {
  chrome.storage.sync.get(['bookmarks'], (data) => console.log(data.bookmarks));
};

(async () => {
  const initialBookmarks = await new Promise<Bookmark[]>(async (resolve) => {
    if (!chrome.storage || !chrome.storage.sync) {
      return resolve(defaultBookmarks);
    }

    chrome.storage.sync.get(['bookmarks'], async function (data) {
      if (chrome.runtime && chrome.runtime.lastError) {
        return resolve(defaultBookmarks);
      }

      let bookmarks: Bookmark[] = defaultBookmarks;
      try {
        if (data.bookmarks) {
          bookmarks = JSON.parse(data.bookmarks);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to parse bookmarks from sync, using defaults', e);
        bookmarks = defaultBookmarks;
      }

      // Merge icons from local storage, if available
      if (chrome.storage.local && bookmarks.length > 0) {
        const keys = bookmarks.map((b) => `icon:${b.id}`);
        chrome.storage.local.get(keys, (icons) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            // eslint-disable-next-line no-console
            console.warn('Failed to read icons from local:', chrome.runtime.lastError.message);
          }
          const withIcons = bookmarks.map((b) => {
            const iconDataUrl = icons[`icon:${b.id}`] as string | undefined;
            return iconDataUrl ? { ...b, iconDataUrl } : b;
          });
          resolve(withIcons);
        });
        return;
      }

      resolve(bookmarks);
    });
  });

  render(() => <App initialBookmarks={initialBookmarks} />, root!);
})();
