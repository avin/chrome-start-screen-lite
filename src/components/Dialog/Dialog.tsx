import { Component, For, JSX } from 'solid-js';
import styles from './Dialog.module.scss';
import Button from '../Button/Button';

const Dialog: Component<{
  title: JSX.Element;
  buttons: { label: string; onClick: () => void; disabled?: boolean }[];
  children: JSX.Element;
}> = (props) => {
  return (
    <div class={styles.overlay}>
      <div class={styles.dialog}>
        <div class={styles.title}>{props.title}</div>

        <div class={styles.body}>{props.children}</div>

        <div class={styles.buttons}>
          <For each={props.buttons}>
            {(button, i) => (
              <Button disabled={button.disabled} onClick={button.onClick}>
                {button.label}
              </Button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
