/* @refresh reload */
import { render } from 'solid-js/web';
import './styles/index.scss';
import App from './components/App/App';
import { defaultBookmarks } from './constants/defaultBookmarks';
import { Bookmark } from './types';

const root = document.getElementById('root');

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
          console.log('~', data.bookmarks);
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
