import cn from 'clsx';
import { Component, JSX, splitProps } from 'solid-js';
import styles from './Input.module.scss';

const Input: Component<JSX.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => {
  const [, rest] = splitProps(props, ['children', 'class']);

  return <input class={cn(props.class, styles.input)} {...rest} />;
};

export default Input;