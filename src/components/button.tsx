'use client'
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    customStyles?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({ title, customStyles, ...rest }) => {
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
            {title}
        </button>
    );
};

export default Button;
