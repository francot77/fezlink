'use client';

import { PlusCircle } from 'lucide-react';
import Button from '@/components/button';
import { useTranslations } from 'next-intl';

interface NewLinkFormProps {
  newUrl: string;
  setNewUrl: (v: string) => void;
  onAdd: () => void;
  urlPreview: string;
}

const NewLinkForm: React.FC<NewLinkFormProps> = ({ newUrl, setNewUrl, onAdd, urlPreview }) => {
  const tLinks = useTranslations('links');
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl animate-in fade-in slide-in-from-top-4"
      style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
      <div className="relative p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10">
            <PlusCircle size={20} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{tLinks('addNewLink')}</h3>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={tLinks('placeholder')}
              value={newUrl}
              onChange={(e) => {
                let value = e.target.value;
                if (value && !value.startsWith('http')) {
                  value = 'https://' + value.replace(/^https?:\/\//, '');
                }
                setNewUrl(value);
              }}
              onKeyDown={(e) => e.key === 'Enter' && onAdd()}
              className={`w-full rounded-xl border px-4 py-3 text-white bg-white/5 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                newUrl && newUrl.startsWith('http')
                  ? 'border-white/10 focus:border-emerald-400/50 focus:ring-emerald-500/20'
                  : 'border-red-500/50 focus:border-red-400 focus:ring-red-500/20'
              }`}
            />
            {urlPreview && (
              <div className="absolute -bottom-6 left-0 text-xs text-emerald-400">→ {urlPreview}</div>
            )}
          </div>
          <Button
            title={tLinks('addLink')}
            disabled={!newUrl || !newUrl.startsWith('http')}
            onClick={onAdd}
            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
              newUrl && newUrl.startsWith('http')
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 hover:shadow-emerald-500/40 active:scale-95'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <PlusCircle size={18} />
            <span className="hidden sm:inline">{tLinks('add')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewLinkForm;

