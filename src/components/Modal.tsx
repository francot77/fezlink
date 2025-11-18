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

const Modal: React.FC<ModalProps> = ({ isOpen, title, description, onAccept, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 overflow-y-auto">
            <div className="relative w-full max-w-5xl rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl shadow-blue-700/20">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        {title && <h2 className="text-2xl font-semibold text-white">{title}</h2>}
                    </div>
                    {onCancel && (
                        <button
                            aria-label="Cerrar"
                            onClick={onCancel}
                            className="rounded-full border border-gray-700 bg-gray-800 p-2 text-gray-300 transition hover:border-gray-500 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="mt-4 text-gray-200">{description}</div>

                {(onAccept || onCancel) && (
                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-gray-500 hover:text-white"
                            >
                                Cancelar
                            </button>
                        )}
                        {onAccept && (
                            <button
                                onClick={onAccept}
                                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                            >
                                Aceptar
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
