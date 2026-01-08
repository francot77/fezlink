'use client';

import { PlusCircle, Link as LinkIcon } from 'lucide-react';
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
      className="relative overflow-hidden rounded-xl border border-white/10 bg-gray-900/60 p-4 animate-in fade-in slide-in-from-top-2"
      style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}
    >
      <div className="flex flex-col gap-3 sm:flex-row items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <LinkIcon size={16} />
          </div>
          <input
            type="text"
            placeholder={tLinks('placeholder')}
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAdd()}
            className={`w-full rounded-lg border bg-black/20 pl-10 pr-4 py-2.5 text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 ${newUrl
                ? 'border-emerald-500/30 focus:border-emerald-500/50 focus:ring-emerald-500/10'
                : 'border-white/10 focus:border-white/20 focus:ring-white/5'
              }`}
          />
          {urlPreview && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              {urlPreview}
            </div>
          )}
        </div>
        <Button
          title={tLinks('addLink')}
          disabled={!newUrl}
          onClick={onAdd}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 w-full sm:w-auto ${newUrl
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 active:scale-95'
              : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
        >
          <PlusCircle size={16} />
          <span>{tLinks('add')}</span>
        </Button>
      </div>
    </div>
  );
};

export default NewLinkForm;

