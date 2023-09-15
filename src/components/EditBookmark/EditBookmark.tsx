import { Component, Show } from 'solid-js';
import { useStore } from '../../store/store';
import EditBookmarkDialog from '../EditTileDialog/EditBookmarkDialog';

const EditBookmark: Component = () => {
  const {
    state,
    actions: { setEditingBookmark, createBookmark, updateBookmark },
  } = useStore();

  const editingBookmarkOptions = () => {
    const id = state.editingBookmark;
    const bookmark = state.bookmarks.find((i) => i.id === id);
    if (bookmark) {
      return {
        title: bookmark.title,
        url: bookmark.url,
      };
    }
    return {};
  };

  return (
    <Show when={state.editingBookmark}>
      <EditBookmarkDialog
        title={
          state.editingBookmark === 'new' ? 'Добавить ярлык' : 'Изменить ярлык'
        }
        onClose={() => {
          setEditingBookmark(null);
        }}
        onSubmit={(data) => {
          if (!/^https?:\/\//.test(data.url)) {
            data.url = `https://${data.url}`;
          }

          if (state.editingBookmark === 'new') {
            createBookmark({
              title: data.title,
              url: data.url,
              position: state.newBookmarkPosition,
            });
          } else {
            updateBookmark(state.editingBookmark as string, {
              title: data.title,
              url: data.url,
            });
          }

          setEditingBookmark(null);
        }}
        initialValues={editingBookmarkOptions()}
      />
    </Show>
  );
};

export default EditBookmark;
