import { useState, useEffect } from 'react';
import CustomModal from '@/components/Modalv2';
import { AtSign, Loader2, Check, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (slug: string) => void;
  initialSlug: string;
  translations: Record<string, string>;
  isLoading?: boolean;
  lastSlugChange?: string | Date;
}

export function UsernameModal({
  isOpen,
  onClose,
  onAccept,
  initialSlug,
  translations: t,
  isLoading = false,
  lastSlugChange
}: UsernameModalProps) {
  const [slug, setSlug] = useState(initialSlug);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const debouncedSlug = useDebounce(slug, 500);

  // Check 3 days restriction
  const daysRemaining = lastSlugChange ? Math.ceil(3 - (Date.now() - new Date(lastSlugChange).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const canChange = daysRemaining <= 0;

  useEffect(() => {
    if (isOpen) {
      setSlug(initialSlug);
      setError('');
      setIsAvailable(null);
    }
  }, [isOpen, initialSlug]);

  useEffect(() => {
    const checkAvailability = async () => {
      // Si es igual al inicial, no chequear, es válido (es el suyo)
      if (debouncedSlug === initialSlug) {
        setIsAvailable(true);
        setError('');
        return;
      }

      if (!debouncedSlug) {
        setIsAvailable(false);
        return;
      }

      if (debouncedSlug.length < 3) {
        setError(t.minChars || 'Minimum 3 characters required');
        setIsAvailable(false);
        return;
      }

      if (!/^[a-zA-Z0-9-_]+$/.test(debouncedSlug)) {
        setError(t.invalidFormat || 'Only letters, numbers, hyphens and underscores allowed');
        setIsAvailable(false);
        return;
      }

      setIsChecking(true);
      setError('');

      try {
        const res = await fetch(`/api/biopage/check-slug?slug=${debouncedSlug}`);
        const data = await res.json();

        if (data.available) {
          setIsAvailable(true);
        } else {
          setError('Username already taken'); // Debería traducir esto
          setIsAvailable(false);
        }
      } catch (err) {
        setError('Error checking availability');
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [debouncedSlug, initialSlug, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSlug(val);

    // Visual reset immediate
    if (val !== initialSlug) {
      setIsAvailable(null);
    }
  };

  const isSame = slug === initialSlug;
  const isValid = !error && isAvailable === true && canChange && !isSame && slug.length >= 3;

  if (!isOpen) return null;

  return (
    <CustomModal
      title={t.changeUsername}
      onClose={onClose}
      onAccept={() => onAccept(slug)}
      acceptText={t.save}
      isLoading={isLoading}
      disabled={!isValid}
    >
      <div className="flex gap-4 flex-col">
        {!canChange && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 mb-2">
            <p className="text-sm text-yellow-200/90">
              You can change your username in {daysRemaining} days.
            </p>
          </div>
        )}

        <div className="space-y-1">
          <div className={`flex items-center rounded-xl border ${error ? 'border-red-500/50 bg-red-500/5' : isAvailable && !isSame ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/5'} transition-all focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 relative`}>
            <div className="flex h-full items-center px-4 border-r border-white/10 text-gray-500 select-none">
              <AtSign size={16} />
            </div>
            <input
              className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={t.usernamePlaceholder}
              value={slug}
              onChange={handleChange}
              disabled={!canChange || isLoading}
              autoFocus
            />

            <div className="absolute right-4 flex items-center pointer-events-none">
              {isChecking ? (
                <Loader2 className="animate-spin text-emerald-400" size={18} />
              ) : isAvailable && !isSame && !error ? (
                <Check className="text-emerald-400" size={18} />
              ) : error ? (
                <X className="text-red-400" size={18} />
              ) : null}
            </div>
          </div>
          {error && <span className="text-xs text-red-400 ml-1">{error}</span>}
          {isAvailable && !isSame && !error && !isChecking && (
            <span className="text-xs text-emerald-400 ml-1">Username available!</span>
          )}
        </div>

        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
          <p className="text-xs text-blue-200/80 leading-relaxed">
            {t.changeNote}
          </p>
        </div>
      </div>
    </CustomModal>
  );
}
