import React from 'react';
import styles from './Button.module.css';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    readonly variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    readonly size?: 'small' | 'medium' | 'large';
    readonly fullWidth?: boolean;
    readonly iconOnly?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    iconOnly = false,
    className = '',
    children,
    ...props
}) => {
    const classes = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        iconOnly ? styles.iconOnly : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button type="button" className={classes} {...props}>
            {children}
        </button>
    );
};