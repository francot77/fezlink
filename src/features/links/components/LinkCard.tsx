import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Check,
  Copy,

  ExternalLink,
  Facebook,
  Flame,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
  QrCode,
  Share2,
  Trash2,
  Twitter,
  Video
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Link } from '@/hooks/useLinks';
import { SupportedLanguage } from '@/types/i18n';
import { createPortal } from 'react-dom';
import { QRModal } from './QRModal';

interface LinkCardProps {
  link: Link;
  onStats: () => void;
  onDelete: () => void;
  language?: SupportedLanguage;
  isDeleting?: boolean;
  index?: number;
}

export const LinkCard = ({
  link,
  onStats,
  onDelete,
  //language = 'en',
  isDeleting = false,
  index = 0,
}: LinkCardProps) => {
  const safeShortUrl = link.shortUrl ?? '';
  const hostname = useMemo(
    () => safeShortUrl.match(/^https?:\/\/(.+)/)?.[1] ?? safeShortUrl,
    [safeShortUrl]
  );
  /* const originalHost = useMemo(
    () => link.destinationUrl.match(/^https?:\/\/([^/]+)/)?.[1] ?? link.destinationUrl,
    [link.destinationUrl]
  ); */
  const tLinks = useTranslations('links');
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [dropdownPlacement, setDropdownPlacement] = useState<'top' | 'bottom'>('bottom');

  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 250; // Estimated height (header + list)
      const spaceBelow = viewportHeight - rect.bottom;

      let top;
      let placement: 'top' | 'bottom';

      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        // Show above if not enough space below
        top = rect.top + scrollY - dropdownHeight;
        placement = 'top';
      } else {
        // Default to below
        top = rect.bottom + scrollY + 8;
        placement = 'bottom';
      }

      setDropdownPos({
        top,
        left: rect.left + rect.width / 2 - 96
      });
      setDropdownPlacement(placement);
    }
  };

  // Handle positioning and scroll updates
  useEffect(() => {
    if (shareOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, { capture: true });
      window.addEventListener('resize', updateDropdownPosition);
    }
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, { capture: true });
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [shareOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setShareOpen(false);
      }
    };
    if (shareOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [shareOpen]);

  const handleCopy = async (text?: string) => {
    const textToCopy = text ?? safeShortUrl;

    const copyToClipboard = async () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        return true;
      }
      return false;
    };

    const fallbackCopy = () => {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      // Ensure textarea is not visible but part of DOM
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch {
        document.body.removeChild(textArea);
        return false;
      }
    };

    try {
      let success = false;
      try {
        success = await copyToClipboard();
      } catch {
        success = false;
      }

      if (!success) {
        success = fallbackCopy();
      }

      if (success) {
        setCopied(true);
        toast.success(tLinks('copied'), { position: 'top-center', richColors: true });
        setTimeout(() => setCopied(false), 1600);
        setShareOpen(false);
      } else {
        throw new Error('Copy failed');
      }
    } catch {
      toast.error('Unable to copy link', { position: 'top-center', richColors: true });
    }
  };

  const buildChannelUrl = (source: string) => `${safeShortUrl}?src=${source}`;

  const sources = [
    { label: 'Instagram', src: 'instagram', icon: Instagram, color: 'text-pink-500' },
    { label: 'WhatsApp', src: 'whatsapp', icon: MessageCircle, color: 'text-green-500' },
    { label: 'TikTok', src: 'tiktok', icon: Video, color: 'text-cyan-500' },
    { label: 'Twitter / X', src: 'twitter', icon: Twitter, color: 'text-blue-400' },
    { label: 'Facebook', src: 'facebook', icon: Facebook, color: 'text-blue-600' },
    { label: 'LinkedIn', src: 'linkedin', icon: Linkedin, color: 'text-blue-700' },
    { label: 'Email', src: 'email', icon: Mail, color: 'text-gray-400' },
  ];

  return (
    <>
      <QRModal
        url={`${safeShortUrl}?src=qr`}
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title={hostname}
        description={link.destinationUrl}
      />

      <div
        className="group relative flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-white/10 bg-gray-900/60 p-3 shadow-lg transition-all duration-300 hover:border-white/20 hover:bg-gray-900/80 animate-in fade-in slide-in-from-bottom-2"
        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
      >
        {/* Loading Overlay */}
        {isDeleting && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/80 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-red-400" />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col min-w-0 w-full sm:w-auto text-center sm:text-left pl-2">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <a
              href={safeShortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate font-semibold text-white hover:text-emerald-400 hover:underline transition-colors"
              title={safeShortUrl}
            >
              {hostname}
            </a>
          </div>
          <p className="truncate text-xs text-gray-500 max-w-[200px] sm:max-w-[300px] mx-auto sm:mx-0">
            {link.destinationUrl}
          </p>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 mt-1 sm:mt-0">

          {/* Clicks Badge - Moved here */}
          <div className="flex h-8 items-center gap-1.5 rounded-lg bg-white/5 px-3 text-xs font-medium text-gray-400 ring-1 ring-white/10 mr-2">
            <BarChart3 size={14} />
            <span className="text-white">{link.clicks}</span>
          </div>

          {/* Stats - Highlighted & Moved Left */}
          <button
            onClick={onStats}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20 transition-all hover:bg-purple-500/20 hover:scale-105 active:scale-95 mr-2"
            title={tLinks('stats')}
          >
            <Globe size={16} />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1 mr-2" />

          {/* Copy Button */}
          <button
            onClick={() => handleCopy()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 transition-colors hover:bg-emerald-500/20 active:scale-95"
            title={tLinks('copy')}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>

          {/* Share Dropdown */}
          <button
            ref={triggerRef}
            onClick={() => {
              if (!shareOpen) updateDropdownPosition();
              setShareOpen(!shareOpen);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 transition-colors hover:bg-blue-500/20 active:scale-95 ${shareOpen ? 'bg-blue-500/20 text-blue-300' : ''}`}
            title="Share with source"
          >
            <Share2 size={16} />
          </button>

          {shareOpen && typeof document !== 'undefined' && createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: dropdownPos.top,
                left: dropdownPos.left,
              }}
              className={`z-50 w-48 rounded-xl border border-white/10 bg-gray-900/95 p-1 shadow-xl backdrop-blur-md animate-in fade-in duration-200 ${dropdownPlacement === 'bottom' ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'
                }`}
            >
              <div className="text-xs font-medium text-gray-500 px-3 py-2 uppercase tracking-wider">Share via</div>
              <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                {sources.map((source) => {
                  const Icon = source.icon;
                  return (
                    <button
                      key={source.src}
                      onClick={() => handleCopy(buildChannelUrl(source.src))}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Icon size={14} className={source.color} />
                      <span>{source.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>,
            document.body
          )}

          {/* QR Code - New Button */}
          <button
            onClick={() => setShowQR(true)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-gray-400 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
            title="QR Code"
          >
            <QrCode size={16} />
            <span className="absolute -top-3 -right-1 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-0.5 py-0.5 text-[9px] font-bold text-white shadow-sm ring-1 ring-black/50">
              <Flame size={16} />
            </span>
          </button>

          {/* Open Link */}
          <a
            href={safeShortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-gray-400 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
            title={tLinks('openLink')}
          >
            <ExternalLink size={16} />
          </a>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Delete */}
          <button
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 ring-1 ring-red-500/20 transition-colors hover:bg-red-500/20 hover:text-red-300 active:scale-95"
            title={tLinks('delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </>
  );
};
