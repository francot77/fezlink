import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type Accent = 'cyan' | 'emerald' | 'purple';

export type Option = {
  value: string;
  label: string;
};

/**
 * Props del componente Select
 * value: valor actual seleccionado
 * onChange: callback al seleccionar un valor
 * options: lista de opciones con { value, label }
 * placeholder: etiqueta cuando no hay selección
 * accent: tema de color del componente
 * className: clases adicionales de estilo
 * ariaLabel: etiqueta accesible para el botón
 */
export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  accent?: Accent;
  className?: string;
  ariaLabel?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  accent = 'cyan',
  className = '',
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const i = options.findIndex((o) => o.value === value);
    return i >= 0 ? i : -1;
  });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    placement: 'bottom' | 'top';
  } | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (buttonRef.current && buttonRef.current.contains(t)) return;
      if (listRef.current && listRef.current.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    const i = options.findIndex((o) => o.value === value);
    setActiveIndex(i >= 0 ? i : -1);
  }, [value, options]);

  const updatePosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const base = {
      top: rect.bottom,
      left: rect.left,
      width: rect.width,
      placement: 'bottom' as const,
    };
    setPosition(base);
    requestAnimationFrame(() => {
      const list = listRef.current;
      if (!list) return;
      const h = list.offsetHeight;
      const fitsBelow = rect.bottom + h <= window.innerHeight - 8;
      const nextTop = fitsBelow ? rect.bottom : Math.max(8, rect.top - h);
      setPosition({
        top: nextTop,
        left: rect.left,
        width: rect.width,
        placement: fitsBelow ? 'bottom' : 'top',
      });
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const accentClasses = useMemo(() => {
    if (accent === 'cyan') {
      return {
        focusRing: 'focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20',
        itemActive: 'text-cyan-300',
        itemSelectedBg: 'bg-cyan-500/20',
        shadow: 'shadow-cyan-500/20',
      };
    }
    if (accent === 'emerald') {
      return {
        focusRing: 'focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20',
        itemActive: 'text-emerald-300',
        itemSelectedBg: 'bg-emerald-500/20',
        shadow: 'shadow-emerald-500/20',
      };
    }
    return {
      focusRing: 'focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20',
      itemActive: 'text-purple-300',
      itemSelectedBg: 'bg-purple-500/20',
      shadow: 'shadow-purple-500/20',
    };
  }, [accent]);

  const currentLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label ?? placeholder ?? '';
  }, [options, value, placeholder]);

  const onKeyDownButton = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      updatePosition();
      setActiveIndex((prev) => {
        if (prev < 0) return 0;
        if (e.key === 'ArrowDown') return Math.min(prev + 1, options.length - 1);
        return Math.max(prev - 1, 0);
      });
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((o) => {
        const next = !o;
        if (next) updatePosition();
        return next;
      });
      return;
    }
  };

  const onKeyDownList = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        onChange(options[activeIndex].value);
        setOpen(false);
        buttonRef.current?.focus();
      }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next =
          e.key === 'ArrowDown'
            ? Math.min((prev < 0 ? 0 : prev) + 1, options.length - 1)
            : Math.max((prev < 0 ? 0 : prev) - 1, 0);
        const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`);
        el?.scrollIntoView({ block: 'nearest' });
        return next;
      });
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() =>
          setOpen((o) => {
            const next = !o;
            if (next) updatePosition();
            return next;
          })
        }
        onKeyDown={onKeyDownButton}
        className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white backdrop-blur-sm transition ${accentClasses.focusRing} flex items-center justify-between`}
      >
        <span className={value ? 'text-white' : 'text-gray-300'}>{currentLabel}</span>
        <svg
          className="h-4 w-4 text-gray-400 transition-transform"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.25 8.29a.75.75 0 0 1-.02-1.08z" />
        </svg>
      </button>
      {open &&
        position &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            onKeyDown={onKeyDownList}
            style={{ top: position.top, left: position.left, width: position.width }}
            className={`fixed z-50 max-h-56 overflow-auto rounded-lg border border-white/10 bg-gray-900/95 text-white backdrop-blur-xl shadow-lg ${accentClasses.shadow} animate-dropdown scrollbar-thin`}
          >
            {placeholder && (
              <li
                role="option"
                aria-selected={value === ''}
                data-index={-1}
                onMouseEnter={() => setActiveIndex(-1)}
                onClick={() => {
                  onChange('');
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                className={`cursor-pointer px-3 py-2 text-sm text-gray-300 hover:bg-white/10`}
              >
                {placeholder}
              </li>
            )}
            {options.map((opt, idx) => {
              const selected = opt.value === value;
              const active = idx === activeIndex;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  data-index={idx}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`cursor-pointer px-3 py-2 text-sm ${selected ? accentClasses.itemActive : 'text-gray-200'} ${active ? 'bg-white/10' : selected ? `${accentClasses.itemSelectedBg}` : ''}`}
                >
                  {opt.label}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </div>
  );
};
