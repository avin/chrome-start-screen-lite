import { Component, Show, createMemo } from 'solid-js';
import { useStore } from '../../store/store';
import EditBookmarkDialog from '../EditTileDialog/EditBookmarkDialog';
import { normalizeUrl } from '../../utils/url';

const EditBookmark: Component = () => {
  const {
    state,
    actions: { setEditingBookmark, createBookmark, updateBookmark },
  } = useStore();

  const isNewBookmark = createMemo(() => state.editingBookmark === 'new');
  
  const editingBookmarkOptions = createMemo(() => {
    if (isNewBookmark()) return {};
    
    const bookmark = state.bookmarks.find(i => i.id === state.editingBookmark);
    return bookmark ? { title: bookmark.title, url: bookmark.url } : {};
  });

  const handleSubmit = (data: { title: string; url: string }) => {
    const normalizedData = {
      title: data.title,
      url: normalizeUrl(data.url)
    };

    if (isNewBookmark()) {
      createBookmark({
        ...normalizedData,
        position: state.newBookmarkPosition,
      });
    } else {
      updateBookmark(state.editingBookmark as string, normalizedData);
    }

    setEditingBookmark(null);
  };

  return (
    <Show when={state.editingBookmark}>
      <EditBookmarkDialog
        title={
          isNewBookmark() 
            ? chrome.i18n.getMessage("addShortcut") 
            : chrome.i18n.getMessage("editShortcut")
        }
        onClose={() => setEditingBookmark(null)}
        onSubmit={handleSubmit}
        initialValues={editingBookmarkOptions()}
      />
    </Show>
  );
};

export default EditBookmark;