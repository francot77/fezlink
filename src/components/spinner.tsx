import React from 'react';

interface SpinnerProps {
    size?: number; // Size of the spinner in pixels
    color?: string; // Color of the spinner
    thickness?: number; // Thickness of the spinner stroke
}

const Spinner: React.FC<SpinnerProps> = ({
    size = 40,
    color = '#000',
    thickness = 4,
}) => {
    const spinnerStyle: React.CSSProperties = {
        width: size,
        height: size,
        border: `${thickness}px solid ${color}33`, // Lighter color for the background
        borderTop: `${thickness}px solid ${color}`, // Main color for the spinner
        borderRadius: '50%',
    };

    return (
        <>
            <div style={spinnerStyle} className="spinner"></div>
            <style jsx>{`
                .spinner {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </>
    );
};

export default Spinner;