import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  collapsible = false,
  defaultOpen = true
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    if (collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <section className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl transition-all duration-300 hover:border-white/20 ${collapsible ? 'cursor-pointer' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        <header
          onClick={toggleOpen}
          className={`flex items-start justify-between gap-4 p-4 sm:p-6 ${collapsible ? 'select-none hover:bg-white/5 transition-colors' : ''}`}
        >
          <div className="space-y-1 sm:space-y-2 flex-1">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10 shrink-0">
                  <Icon size={18} className="text-emerald-400 sm:w-5 sm:h-5" />
                </div>
              )}
              <h3 className="text-lg sm:text-xl font-semibold text-white leading-tight">{title}</h3>
            </div>
            {description && (
              <p className={`text-xs sm:text-sm text-gray-400 leading-relaxed ${Icon ? 'pl-[44px] sm:pl-[52px]' : ''} ${!isOpen && collapsible ? 'line-clamp-1' : ''}`}>
                {description}
              </p>
            )}
          </div>

          {collapsible && (
            <div className={`p-1 rounded-full bg-white/5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
              <ChevronDown size={20} />
            </div>
          )}
        </header>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6 mt-2">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
