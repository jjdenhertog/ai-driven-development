import React from 'react';
import { Button, ButtonProps } from './Button';
import styles from './ListButton.module.css';

export type ListButtonProps = ButtonProps & {
    readonly selected?: boolean;
}

export const ListButton: React.FC<ListButtonProps> = ({
    selected = false,
    className = '',
    children,
    ...props
}) => {
    const classes = [
        styles.listButton,
        selected ? styles.selected : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <Button
            {...props}
            fullWidth
            className={classes}
        >
            {children}
        </Button>
    );
};