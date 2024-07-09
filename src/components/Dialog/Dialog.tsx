import { Component, For, JSX } from 'solid-js';
import styles from './Dialog.module.scss';
import Button from '../Button/Button';

const Dialog: Component<{
  title: JSX.Element;
  buttons: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    submit?: boolean;
  }[];
  children: JSX.Element;
}> = (props) => {
  return (
    <div class={styles.overlay}>
      <form class={styles.dialog}>
        <div class={styles.title}>{props.title}</div>

        <div class={styles.body}>{props.children}</div>

        <div class={styles.buttons}>
          <For each={props.buttons}>
            {(button, i) => (
              <Button
                disabled={button.disabled}
                onClick={button.onClick}
                type={button.submit ? 'submit' : 'button'}
              >
                {button.label}
              </Button>
            )}
          </For>
        </div>
      </form>
    </div>
  );
};

export default Dialog;
