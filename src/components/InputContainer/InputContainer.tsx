import cn from 'clsx';
import { Component, JSX, splitProps } from 'solid-js';
import styles from './InputContainer.module.scss';

const InputContainer: Component<
  JSX.HTMLAttributes<HTMLDivElement> & { label?: JSX.Element }
> = (props) => {
  const [, rest] = splitProps(props, ['children', 'class']);

  return (
    <div class={cn(props.class, styles.container)} {...rest}>
      {props.label && <div class={styles.label}>{props.label}</div>}
      {props.children}
    </div>
  );
};

export default InputContainer;
