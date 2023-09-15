import cn from 'clsx';
import { Component, JSX, splitProps } from 'solid-js';
import styles from './Button.module.scss';

const Button: Component<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (
  props,
) => {
  const [, rest] = splitProps(props, ['children', 'class']);
  return (
    <button type="button" class={cn(styles.button, props.class)} {...rest}>
      {props.children}
    </button>
  );
};

export default Button;
