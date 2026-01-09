/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Share2, Settings, Palette, Type, Layout, Check } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { useTranslations } from 'next-intl';

interface QRModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const QRModal: React.FC<QRModalProps> = ({
  url,
  isOpen,
  onClose,
  title: initialTitle = '',
  description: initialDescription = ''
}) => {
  const tLinks = useTranslations('links');

  // Customization State
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [showTitle, setShowTitle] = useState(true);
  const [showDescription, setShowDescription] = useState(true);

  // Style State
  const [bgColor, setBgColor] = useState('#1e293b'); // Default slate-800
  const [borderColor, setBorderColor] = useState('#3b82f6'); // Default blue-500
  const [borderWidth, setBorderWidth] = useState(4);
  const [isGradient, setIsGradient] = useState(false);
  // Using explicit linear-gradient with Hex colors to avoid oklab/tailwind issues in html2canvas
  const [gradient, setGradient] = useState('linear-gradient(135deg, #2563eb, #9333ea)'); // Blue-600 to Purple-600

  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update local state when props change
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setDescription(initialDescription);
    }
  }, [isOpen, initialTitle, initialDescription]);

  if (!isOpen || typeof document === 'undefined') return null;

  const generateBlob = async (): Promise<Blob | null> => {
    if (!previewRef.current) return null;
    setIsDownloading(true);
    try {
      // Small delay to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(previewRef.current, {
        // @ts-ignore
        scale: 4, // Restored high quality
        useCORS: true,
        backgroundColor: null, // Transparent background
        logging: false,
        scrollX: 0,
        scrollY: 0,
        // Force specific font rendering to avoid overlap
        onclone: (clonedDoc: any) => {
          const element = clonedDoc.querySelector('[data-qr-card]');
          if (element instanceof HTMLElement) {
            element.style.fontFamily = 'Arial, sans-serif';
            element.style.fontVariantLigatures = 'none';

            // Fix Title rendering specifically
            const titleEl = element.querySelector('h2');
            if (titleEl) {
              titleEl.style.whiteSpace = 'pre-wrap';
              titleEl.style.wordSpacing = '0.1em';
              titleEl.style.letterSpacing = '0.02em';
              titleEl.style.lineHeight = '1.4';
              // Force redraw/reflow hack if needed, but styles should suffice
            }

            // Fix Description rendering
            const descEl = element.querySelector('p');
            if (descEl) {
              descEl.style.whiteSpace = 'pre-wrap';
              descEl.style.lineHeight = '1.5';
              descEl.style.letterSpacing = '0.01em';
            }
          }
        }
      });
      return await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    } catch (error) {
      console.error('Generation failed:', error);
      return null;
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = async () => {
    const blob = await generateBlob();
    if (!blob) {
      toast.error(tLinks('qr.toasts.generateError'));
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${title || 'code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(tLinks('qr.download') + ' OK!');
  };

  const handleShare = async () => {
    const blob = await generateBlob();
    if (!blob) {
      toast.error(tLinks('qr.toasts.generateError'));
      return;
    }

    try {
      const file = new File([blob], `qr-${title || 'code'}.png`, { type: 'image/png' });
      const shareData = {
        title: title || 'QR Code',
        text: description || url,
      };

      // 1. Try Native Share (Files)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          ...shareData,
          files: [file]
        });
        toast.success(tLinks('qr.toasts.shareSuccess'));
        return;
      }

      // 2. Try Native Share (Text only)
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success(tLinks('qr.toasts.linkShareSuccess'));
        return;
      }

      // 3. Fallback: Copy Image to Clipboard
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        setCopied(true);
        toast.success(tLinks('qr.toasts.imageCopied'));
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      throw new Error('No share methods available');
    } catch (error) {
      console.error('Share process failed:', error);
      if ((error as Error).name !== 'AbortError') {
        // Last resort: Copy Link
        try {
          await navigator.clipboard.writeText(url);
          toast.success(tLinks('qr.toasts.linkCopied'));
        } catch {
          toast.error(tLinks('qr.toasts.shareError'));
        }
      }
    }
  };


  // Pre-calculated hex gradients for compatibility
  const gradients = [
    { name: 'Blue/Purple', value: 'linear-gradient(135deg, #2563eb, #9333ea)', class: 'bg-gradient-to-br from-blue-600 to-purple-600' },
    { name: 'Emerald/Teal', value: 'linear-gradient(135deg, #10b981, #0d9488)', class: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    { name: 'Orange/Red', value: 'linear-gradient(135deg, #f97316, #dc2626)', class: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { name: 'Pink/Rose', value: 'linear-gradient(135deg, #ec4899, #e11d48)', class: 'bg-gradient-to-br from-pink-500 to-rose-600' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content - Responsive Layout */}
      <div className="relative w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-2xl border-none md:border border-white/10 bg-gray-900 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row overflow-hidden">

        {/* Close Button - Fixed on Mobile */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-white/20 transition-colors backdrop-blur-md md:bg-transparent md:text-gray-400 md:hover:bg-white/10 md:hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Left: Preview Area (Approx 5/8 on mobile) */}
        <div className="flex-[5] md:flex-1 flex flex-col items-center justify-center p-2 md:p-8 bg-black/20 relative min-h-0">
          <h3 className="text-lg font-medium text-gray-400 mb-2 md:mb-6 flex items-center gap-2 mt-2 md:mt-0">
            <Layout size={18} />
            {tLinks('qr.preview')}
          </h3>

          {/* The Card to Capture */}
          <div className="transform scale-[0.85] xs:scale-75 sm:scale-90 md:scale-100 origin-center transition-transform">
            <div
              ref={previewRef}
              data-qr-card="true"
              className={`relative flex flex-col items-center p-8 rounded-[32px] w-[320px] transition-all duration-300`}
              style={{
                background: isGradient ? gradient : bgColor,
                borderColor: borderColor,
                borderWidth: `${borderWidth}px`,
                borderStyle: 'solid',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' // Explicit hex shadow
              }}
            >
              {/* Title */}
              {showTitle && (
                <h2 className="text-2xl font-bold mb-6 text-center leading-tight break-words w-full"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    color: '#ffffff', // Explicit hex color
                    fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.4', // Increased line height
                    letterSpacing: '0.02em', // Explicit letter spacing
                    wordSpacing: '0.1em', // Explicit word spacing
                    whiteSpace: 'pre-wrap', // Preserve wrapping
                    wordBreak: 'break-word', // Break long words
                    fontVariantLigatures: 'none' // Disable ligatures
                  }}>
                  {title || tLinks('qr.titlePlaceholder')}
                </h2>
              )}

              {/* QR Container */}
              <div
                className="p-4 rounded-2xl"
                style={{
                  backgroundColor: '#ffffff', // Explicit hex
                  boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' // Explicit hex shadow
                }}
              >
                <QRCodeCanvas
                  value={url}
                  size={200}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#000000"
                  includeMargin={false}
                />
              </div>

              {/* Description */}
              {showDescription && (
                <p className="text-sm font-medium mt-6 text-center break-words w-full px-2"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    color: 'rgba(255, 255, 255, 0.9)', // Explicit rgba
                    lineHeight: '1.5', // More relaxed line height
                    letterSpacing: '0.01em', // Slight spacing to prevent overlap
                    fontFamily: 'sans-serif',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontVariantLigatures: 'none'
                  }}>
                  {description || tLinks('qr.descPlaceholder')}
                </p>
              )}

              {/* Branding Footer */}
              <div
                style={{
                  marginTop: '32px',
                  textAlign: 'center',
                  opacity: 0.8,
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginRight: '8px',
                    position: 'relative',
                    top: '1px' // Optical adjustment
                  }}
                >
                  {tLinks('qr.poweredBy')}
                </span>

                <span
                  style={{

                    color: '#52d241',
                    fontWeight: 'bold'
                  }}
                >
                  FL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls Area (Approx 3/8 on mobile) */}
        <div className="flex-[3] md:w-[360px] md:flex-none border-t md:border-t-0 md:border-l border-white/10 bg-gray-900/50 flex flex-col min-h-0">
          <div className="p-3 md:p-6 border-b border-white/10 shrink-0">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Settings size={20} className="text-emerald-400" />
              {tLinks('qr.customize')}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-8 scrollbar-thin scrollbar-thumb-gray-700 pb-20 md:pb-6">

            {/* Content Section */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Type size={14} />
                {tLinks('qr.content')}
              </h3>

              <div className="space-y-2 md:space-y-3">
                <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">{tLinks('qr.showTitle')}</label>
                    <input
                      type="checkbox"
                      checked={showTitle}
                      onChange={(e) => setShowTitle(e.target.checked)}
                      className="rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  {showTitle && (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={tLinks('qr.titlePlaceholder')}
                      className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">{tLinks('qr.showDescription')}</label>
                    <input
                      type="checkbox"
                      checked={showDescription}
                      onChange={(e) => setShowDescription(e.target.checked)}
                      className="rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  {showDescription && (
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={tLinks('qr.descPlaceholder')}
                      className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Palette size={14} />
                Appearance
              </h3>

              {/* Background */}
              <div className="space-y-2 md:space-y-3">
                <label className="text-sm font-medium text-gray-300 block">{tLinks('qr.background')}</label>

                <div className="grid grid-cols-5 gap-2">
                  {/* Solid Colors */}
                  {['#1e293b', '#0f172a', '#4c0519', '#1e1b4b', '#14532d'].map(color => (
                    <button
                      key={color}
                      onClick={() => { setBgColor(color); setIsGradient(false); }}
                      className={`h-8 rounded-lg border transition-all ${!isGradient && bgColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {/* Gradients */}
                  {gradients.map(g => (
                    <button
                      key={g.name}
                      onClick={() => { setGradient(g.value); setIsGradient(true); }}
                      className={`h-10 rounded-lg border text-xs font-medium text-white/90 shadow-sm transition-all ${isGradient && gradient === g.value ? 'border-white scale-105' : 'border-transparent opacity-80 hover:opacity-100'}`}
                      style={{ background: g.value }}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>

                {!isGradient && (
                  <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/5">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer bg-transparent border-none p-0"
                    />
                    <span className="text-xs text-gray-400 font-mono">{bgColor}</span>
                  </div>
                )}
              </div>

              {/* Border */}
              <div className="space-y-2 md:space-y-3 pt-2">
                <label className="text-sm font-medium text-gray-300 block">{tLinks('qr.border')}</label>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-500">None</span>
                      <span className="text-[10px] text-gray-500">Thick</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-lg border border-white/5">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="h-6 w-6 rounded cursor-pointer bg-transparent border-none p-0"
                      title="Border Color"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-3 md:p-6 border-t border-white/10 bg-gray-900/90 backdrop-blur-sm absolute bottom-0 left-0 right-0 md:relative z-10">
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-bold text-white transition-all hover:bg-white/20 active:scale-[0.98] disabled:opacity-50"
              >
                {copied ? <Check size={18} /> : <Share2 size={18} />}
                {copied ? tLinks('copied') : tLinks('qr.share')}
              </button>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {tLinks('qr.generating')}
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    {tLinks('qr.download')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
