/* @refresh reload */
import { render } from 'solid-js/web';
import './styles/index.scss';
import App from './components/App/App';
import { defaultBookmarks } from './constants/defaultBookmarks';
import { Bookmark } from './types';

document.addEventListener('DOMContentLoaded', function () {
  document.title = chrome.i18n.getMessage('newTabTitle');
});

const root = document.getElementById('root');

window.debug_setBookmarks = (bookmarks: string) => {
  chrome.storage.sync.set({ bookmarks: bookmarks });
};
window.debug_dumpBookmarks = () => {
  chrome.storage.sync.get(['bookmarks'], (data) => console.log(data.bookmarks));
};

(async () => {
  const initialBookmarks = await new Promise<Bookmark[]>((resolve, reject) => {
    if (!chrome.storage) {
      return resolve(defaultBookmarks);
    }
    chrome.storage.sync.get(['bookmarks'], function (data) {
      if (chrome.runtime.lastError) {
        resolve(defaultBookmarks);
      } else {
        try {
          const bookmarks = JSON.parse(data.bookmarks);
          return resolve(bookmarks);
        } catch (e) {
          console.warn(e);
          return resolve(defaultBookmarks);
        }
      }
    });
  });

  render(() => <App initialBookmarks={initialBookmarks} />, root!);
})();
