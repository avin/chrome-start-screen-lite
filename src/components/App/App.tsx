import type { Component } from 'solid-js';
import { StoreProvider } from '../../store/store';
import { Bookmark } from '../../types';
import ContextMenu from '../ContextMenu/ContextMenu';
import EditBookmark from '../EditBookmark/EditBookmark';
import MainArea from '../MainArea/MainArea';

const App: Component<{ initialBookmarks: Bookmark[] }> = (props) => {
  return (
    <StoreProvider initialState={{ bookmarks: props.initialBookmarks }}>
      <ContextMenu />
      <EditBookmark />
      <MainArea />
    </StoreProvider>
  );
};

export default App;
