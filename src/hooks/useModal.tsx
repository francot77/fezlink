import React, { ReactNode, useState } from 'react';

export interface ModalProps {
    isOpen: boolean;
    title?: string;
    isLoading?: boolean;
    description?: ReactNode;
    onAccept?: () => void;
    onCancel?: () => void;
    isStats?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, description, onAccept, onCancel, isStats }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal} className='shadow-blue-500 shadow-2xl border-2 border-gray-900 '>
                <h2>{title}</h2>
                <div>{description}</div>
                <div style={styles.buttons}>
                    <button onClick={onAccept} style={styles.acceptButton}>Accept</button>
                    {isStats == null ? <button onClick={onCancel} style={styles.cancelButton}>Cancel</button> : null}
                </div>
            </div>
        </div>
    );
};

const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);

    return {
        isOpen,
        openModal,
    };
};

const styles = {
    overlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#000',
        padding: '20px',
        borderRadius: '8px',
        width: '400px',
        textAlign: 'center' as const,
    },
    buttons: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: "10px"
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    cancelButton: {
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export { Modal, useModal };