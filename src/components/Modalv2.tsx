import { ReactNode } from "react";

interface CustomModalProps {
    title: string;
    children: ReactNode;
    onClose: () => void;
    onAccept: () => void;
    acceptText?: string;
}

const CustomModal = ({
    title,
    children,
    onClose,
    onAccept,
    acceptText = "Aceptar",
}: CustomModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl shadow-2xl shadow-black/30 overflow-hidden w-full max-w-md mx-auto">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">×</button>
                </div>
                <div className="p-4">
                    {children}
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition">
                        Cancelar
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
                    >
                        {acceptText}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default CustomModal