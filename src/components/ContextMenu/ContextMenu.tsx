import mitt from 'mitt';
import {
  Component,
  For,
  JSX,
  Show,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import styles from './ContextMenu.module.scss';
import { Position } from '../../types';
import { clickOutsideDirective } from '../../utils/directives/clickOutsideDirective';

const clickOutside = clickOutsideDirective;

interface MenuItem {
  title: JSX.Element;
  onClick: () => void;
}

interface OpenMenuParams {
  coordinates: Position;
  menuItems: MenuItem[];
}

const emitter = mitt<{
  openMenu: OpenMenuParams;
}>();

export const openContextMenu = (e: MouseEvent, menuItems: MenuItem[]) => {
  emitter.emit('openMenu', {
    coordinates: [e.pageX, e.pageY],
    menuItems,
  });
};

const ContextMenu: Component = () => {
  const [menuCoordinates, setMenuCoordinates] = createSignal<Position>([0, 0]);
  const [menuItems, setMenuItems] = createSignal<MenuItem[]>([]);
  const [isOpen, setIsOpen] = createSignal(false);

  const handleOpenMenu = ({ coordinates, menuItems }: OpenMenuParams) => {
    setMenuItems(menuItems);
    setMenuCoordinates(coordinates);
    setIsOpen(true);
  };

  onMount(() => {
    emitter.on('openMenu', handleOpenMenu);
  });

  onCleanup(() => {
    emitter.off('openMenu', handleOpenMenu);
  });

  return (
    <Show when={isOpen()}>
      <div
        class={styles.menu}
        use:clickOutside={() => setIsOpen(false)}
        style={{
          left: `${menuCoordinates()[0]}px`,
          top: `${menuCoordinates()[1]}px`,
        }}
      >
        <For each={menuItems()}>
          {(menuItem, i) => (
            <div class={styles.menuItem}>
              <button
                onClick={() => {
                  menuItem.onClick();
                  setIsOpen(false);
                }}
              >
                {menuItem.title}
              </button>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
};

export default ContextMenu;
