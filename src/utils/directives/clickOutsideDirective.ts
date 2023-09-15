import { Accessor, onCleanup } from 'solid-js';

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      clickOutside: () => void;
    }
  }
}

export function clickOutsideDirective(
  el: HTMLElement,
  accessor: Accessor<() => void>,
) {
  const onClick = (e: MouseEvent) => {
    if (e.target instanceof HTMLElement && !el.contains(e.target)) {
      const callback = accessor();
      if (typeof callback === 'function') {
        callback();
      }
    }
  };

  document.body.addEventListener('click', onClick);
  onCleanup(() => document.body.removeEventListener('click', onClick));
}
