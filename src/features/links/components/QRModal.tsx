import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Copy, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface QRModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ url, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Robust mobile detection including iPad on iOS 13+ (which reports as Macintosh)
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
      (navigator.maxTouchPoints > 0 && /Macintosh/.test(ua));

    // Always show Share on mobile, Copy on desktop
    setCanShare(isMobile);
  }, []);

  // Use quickchart.io for high-quality QR generation
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(url)}&size=400&margin=1&ecLevel=H&format=png`;

  if (!isOpen || typeof document === 'undefined') return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('QR Code downloaded!');
    } catch {
      toast.error('Failed to download QR Code');
    }
  };

  const handleCopyImage = async () => {
    try {
      const blob = await (await fetch(qrUrl)).blob();

      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        setCopied(true);
        toast.success('QR Code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch {
      // If copy fails, try to download as last resort
      toast.error('Copy failed, downloading instead...');
      handleDownload();
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      toast.error('Native sharing not supported (requires HTTPS)', { position: 'top-center' });
      return;
    }

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });

      const shareData = {
        title: 'QR Code',
        text: 'Check out this link!',
        url: url,
      };

      // Try to share with file first
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          ...shareData,
          files: [file]
        });
      } else {
        // Fallback to just URL/Text if file sharing not supported
        await navigator.share(shareData);
      }
      toast.success('Shared successfully!');
    } catch (error) {
      console.error('Share failed:', error);
      if ((error as Error).name !== 'AbortError') {
        toast.error('Failed to share');
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">QR Code</h3>
            <p className="text-sm text-gray-400 truncate px-4">{url}</p>
          </div>

          <div className="flex justify-center">
            <div className="relative rounded-xl bg-white p-4 shadow-lg ring-4 ring-white/10">
              <img
                src={qrUrl}
                alt="QR Code"
                className="h-48 w-48 object-contain"
                loading="eager"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {canShare ? (
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
              >
                <Share2 size={18} />
                Share
              </button>
            ) : (
              <button
                onClick={handleCopyImage}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Image'}
              </button>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <Download size={18} />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
