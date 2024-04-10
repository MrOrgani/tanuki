import { ComponentPropsWithRef, forwardRef, ReactNode } from 'react';
import styles from 'styles/components/common/Button.module.scss';

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  stylePreset?: 'contained' | 'outlined' | 'link';
  variant?: 'primary' | 'danger';
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ stylePreset = 'contained', variant = 'primary', children, ...props }, ref) => {
    return (
      <button
        className={`${styles.button} ${styles[stylePreset]} ${styles[variant]}`}
        ref={ref}
        {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
