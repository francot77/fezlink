import { Upload, X, Check } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import Button from '@/components/button';
import { useState } from 'react';

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
  translations: t,
}: AvatarModalProps) {
  if (!isOpen) return null;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error(`${t.avatarError} File too large (max 1MB)`, {
        richColors: true,
        position: 'top-center',
      });
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error(`${t.avatarError} Invalid file type`, {
        richColors: true,
        position: 'top-center',
      });
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      const initRes = await fetch('/api/avatar/upload-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type, size: file.size }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || 'Init failed');

      const { uploadUrl, key, publicUrl } = initData as {
        uploadUrl: string;
        key: string;
        publicUrl: string;
      };

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(file);
      });

      const completeRes = await fetch('/api/avatar/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const completeData = await completeRes.json();
      if (!completeRes.ok) throw new Error(completeData.error || 'Complete failed');

      const finalUrl: string = completeData.url ?? publicUrl;
      onUploadComplete(finalUrl);
      toast.success(t.avatarUploadSuccess, { richColors: true, position: 'top-center' });
      setUploading(false);
      setProgress(0);
    } catch (error: any) {
      setUploading(false);
      setProgress(0);
      toast.error(`${t.avatarError} ${error?.message ?? 'Unknown error'}`, {
        richColors: true,
        position: 'top-center',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
        <div className="relative p-6 space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
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
          <div className="space-y-3">
            <label className="block text-sm text-gray-300">{t.avatarPrompt}</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-sm transition focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {uploading && (
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10"
            >
              <X size={16} />
              {t.cancel}
            </button>
            <Button
              title={t.close}
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 font-semibold transition-all duration-300 hover:scale-105"
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
