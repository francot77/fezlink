import React, { ReactNode } from 'react';

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
            <div style={styles.modal} className='shadow-blue-700/30 bg-gray-800 shadow-2xl border-2 border-gray-900'>
                <h2>{title}</h2>
                <div>{description}</div>
                <div style={styles.buttons}>
                    {onAccept && <button onClick={onAccept} style={styles.acceptButton}>Aceptar</button>}
                    {onCancel && isStats !== true && (
                        <button onClick={onCancel} style={styles.cancelButton}>Cancelar</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { padding: '20px', borderRadius: '8px', width: '400px', textAlign: 'center' as const },
    buttons: { marginTop: '20px', display: 'flex', justifyContent: 'center', gap: "10px" },
    acceptButton: { backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' },
    cancelButton: { backgroundColor: '#f44336', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' },
};

export default Modal;
