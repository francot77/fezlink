import CustomModal from '@/components/Modalv2';

interface UsernameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    inputSlug: string;
    setInputSlug: (value: string) => void;
    translations: Record<string, string>;
}

export function UsernameModal({
    isOpen,
    onClose,
    onAccept,
    inputSlug,
    setInputSlug,
    translations: t
}: UsernameModalProps) {
    if (!isOpen) return null;

    return (
        <CustomModal
            title={t.changeUsername}
            onClose={onClose}
            onAccept={onAccept}
            acceptText={t.save}
        >
            <div className='flex gap-3 flex-col'>
                <input
                    className='w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-sm transition focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
                    placeholder={t.usernamePlaceholder}
                    value={inputSlug}
                    onChange={(e) => setInputSlug(e.target.value)}
                />
                <span className="text-xs text-gray-400">
                    {t.changeNote}
                </span>
            </div>
        </CustomModal>
    );
}