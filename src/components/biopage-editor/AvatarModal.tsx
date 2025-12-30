import { Upload, X, Check } from 'lucide-react';
import Image from 'next/image';
import { UploadButton } from '@/utils/uploadthings';
import { toast } from 'sonner';
import Button from '@/components/button';

interface AvatarModalProps {
    isOpen: boolean;
    onClose: () => void;
    avatarUrl: string;
    defaultAvatar: string;
    onUploadComplete: (url: string) => void;
    translations: Record<string, string>;
}

export function AvatarModal({
    isOpen,
    onClose,
    avatarUrl,
    defaultAvatar,
    onUploadComplete,
    translations: t
}: AvatarModalProps) {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'>
            <div className='relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-xl shadow-2xl'>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
                <div className='relative p-6 space-y-6'>
                    <div className='flex flex-col items-center gap-4 text-center'>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10">
                            <Upload size={24} className="text-emerald-400" />
                        </div>
                        <h1 className="text-xl font-semibold">{t.avatarPrompt}</h1>
                        <div className="relative w-32 h-32 rounded-2xl overflow-hidden ring-2 ring-emerald-400/50 shadow-xl shadow-emerald-500/20">
                            <Image
                                src={avatarUrl || defaultAvatar}
                                alt="avatar"
                                className="w-full h-full object-cover"
                                width={128}
                                height={128}
                            />
                        </div>
                    </div>
                    <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                            const uploadedUrl = res?.[0]?.url;
                            if (uploadedUrl) {
                                onUploadComplete(uploadedUrl);
                                toast.success(t.avatarUploadSuccess, { richColors: true, position: 'top-center' });
                            }
                        }}
                        onUploadError={(error: Error) => {
                            toast.error(`${t.avatarError} ${error.message}`, { richColors: true, position: 'top-center' });
                        }}
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className='flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10'
                        >
                            <X size={16} />
                            {t.cancel}
                        </button>
                        <Button
                            title={t.close}
                            onClick={onClose}
                            className='flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 font-semibold transition-all duration-300 hover:scale-105'
                        >
                            <Check size={16} />
                            {t.close}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}