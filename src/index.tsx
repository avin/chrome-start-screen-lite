/* @refresh reload */
import { render } from 'solid-js/web';
import './styles/index.scss';
import App from './components/App/App';
import { defaultBookmarks } from './constants/defaultBookmarks';
import { loadBookmarksFromStorage, saveBookmarksToLocal } from './utils/bookmarksStorage';

document.title = chrome.i18n.getMessage('newTabTitle');

const root = document.getElementById('root');

window.debug_setBookmarks = (bookmarks: string) => {
  try {
    const parsedBookmarks = JSON.parse(bookmarks);
    if (!Array.isArray(parsedBookmarks)) {
      throw new Error('Bookmarks payload must be an array');
    }

    void saveBookmarksToLocal(parsedBookmarks);
  } catch (error) {
    console.warn('Failed to set bookmarks from debug helper:', error);
  }
};
window.debug_dumpBookmarks = () => {
  chrome.storage.local.get(['bookmarks'], (data) => console.log(data.bookmarks));
};

(async () => {
  const initialBookmarks = await loadBookmarksFromStorage(defaultBookmarks);

  render(() => <App initialBookmarks={initialBookmarks} />, root!);
})();
