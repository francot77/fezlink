import { useState, useMemo } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  Trash2,
  Instagram,
  MessageCircle,
  QrCode,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Link } from '@/hooks/useLinks';
import { SupportedLanguage } from '@/types/i18n';

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
  language = 'en',
  isDeleting = false,
  index = 0,
}: LinkCardProps) => {
  const safeShortUrl = link.shortUrl ?? '';
  const hostname = useMemo(
    () => safeShortUrl.match(/^https?:\/\/(.+)/)?.[1] ?? safeShortUrl,
    [safeShortUrl]
  );
  const originalHost = useMemo(
    () => link.destinationUrl.match(/^https?:\/\/([^/]+)/)?.[1] ?? link.destinationUrl,
    [link.destinationUrl]
  );
  const tLinks = useTranslations('links');
  const [copied, setCopied] = useState(false);
  const [channelCopied, setChannelCopied] = useState<string | null>(null);

  const buildChannelUrl = (source: string) => `${safeShortUrl}?src=${source}`;

  const handleCopy = async (value?: string) => {
    const textToCopy = value ?? safeShortUrl;
    let success = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(textToCopy);
        success = true;
      }
    } catch {}
    if (!success) {
      try {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        ta.style.position = 'fixed';
        ta.style.top = '0';
        ta.style.left = '0';
        ta.style.opacity = '0';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.select();
        const range = document.createRange();
        range.selectNodeContents(ta);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
        success = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {}
    }
    if (success) {
      setCopied(true);
      toast.success(tLinks('copied'), { position: 'top-center', richColors: true });
      setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error('Unable to copy link', { position: 'top-center', richColors: true });
    }
  };

  const handleChannelCopy = async (label: string, value: string) => {
    setChannelCopied(label);
    await handleCopy(value);
    setTimeout(() => setChannelCopied((current) => (current === label ? null : current)), 1600);
  };

  const channels = [
    {
      label: tLinks('copyInstagram'),
      src: 'instagram_bio',
      icon: Instagram,
      color: 'from-pink-500 to-purple-500',
    },
    {
      label: tLinks('copyWhatsapp'),
      src: 'whatsapp',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-600',
    },
    { label: tLinks('copyQr'), src: 'qr_local', icon: QrCode, color: 'from-cyan-500 to-blue-600' },
  ];

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {isDeleting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-red-400" />
            <span className="text-sm font-semibold text-red-400">{tLinks('deleting')}</span>
          </div>
        </div>
      )}

      <div className="relative p-4 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
              <LinkIcon size={20} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                {originalHost}
              </p>
              <a
                className="block truncate text-base sm:text-lg font-semibold text-white transition-colors hover:text-emerald-400"
                href={safeShortUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={hostname}
              >
                {hostname}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 px-3 py-1.5 ring-1 ring-white/10">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-sm font-bold text-white">{link.clicks}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleCopy()}
          className={`w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300 active:scale-95 ${
            copied
              ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/20'
              : 'border-white/10 bg-white/5 text-gray-300 hover:border-emerald-400/40 hover:bg-white/10 hover:text-white'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? tLinks('copied') : tLinks('copy')}
        </button>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {tLinks('quickShare')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {channels.map((channel) => {
              const url = buildChannelUrl(channel.src);
              const isCopied = channelCopied === channel.src;
              const Icon = channel.icon;

              return (
                <button
                  key={channel.src}
                  onClick={() => handleChannelCopy(channel.src, url)}
                  className={`group/btn relative overflow-hidden rounded-lg border p-3 transition-all duration-300 active:scale-95 ${
                    isCopied
                      ? 'border-emerald-400/60 bg-emerald-500/20 shadow-lg shadow-emerald-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                  title={channel.label}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${channel.color} opacity-0 transition-opacity duration-300 ${isCopied ? 'opacity-20' : 'group-hover/btn:opacity-10'}`}
                  />
                  <div className="relative flex flex-col items-center gap-1.5">
                    {isCopied ? (
                      <Check size={18} className="text-emerald-400" />
                    ) : (
                      <Icon
                        size={18}
                        className="text-gray-400 transition-colors group-hover/btn:text-white"
                      />
                    )}
                    <span
                      className={`text-xs font-medium transition-colors ${
                        isCopied ? 'text-emerald-300' : 'text-gray-500 group-hover/btn:text-gray-300'
                      }`}
                    >
                      {isCopied ? tLinks('copied') : channel.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            onClick={onStats}
            disabled={isDeleting}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50"
          >
            <BarChart3 size={16} />
            <span className="hidden sm:inline">{tLinks('stats')}</span>
          </button>
          <a
            href={safeShortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-gray-300 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95 ${isDeleting ? 'pointer-events-none opacity-50' : ''}`}
          >
            <ExternalLink size={16} />
            <span className="hidden sm:inline">{tLinks('openLink')}</span>
          </a>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-red-600/10 px-3 py-2.5 text-sm font-semibold text-red-400 ring-1 ring-red-500/20 transition-all duration-300 hover:bg-red-600/20 hover:ring-red-500/40 hover:text-red-300 active:scale-95 disabled:opacity-50"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">{tLinks('delete')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
