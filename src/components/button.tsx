'use client'
import React from 'react';

interface ButtonProps {
    title: string;
    onClick: () => void;
    customStyles?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({ title, onClick, customStyles }) => {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '5px 10px',
                fontSize: '16px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#007BFF',
                color: '#fff',
                ...customStyles,
            }}
        >
            {title}
        </button>
    );
};

export default Button;