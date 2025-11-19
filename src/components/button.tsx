'use client'
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    customStyles?: React.CSSProperties;
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ title, customStyles, children, ...rest }) => {
    return (
        <button
            style={{
                fontSize: '16px',
                borderRadius: '5px',
                cursor: 'pointer',
                ...customStyles,
            }}
            {...rest}
        >
            {children ?? title}
        </button>
    );
};

export default Button;
