import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: ReactNode;
}

export function SectionCard({ title, description, icon: Icon, children }: SectionCardProps) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl transition-all duration-300 hover:border-white/20">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative p-6 space-y-4">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10">
                <Icon size={20} className="text-emerald-400" />
              </div>
            )}
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          {description && <p className="text-sm text-gray-400">{description}</p>}
        </header>
        <div className="space-y-4">{children}</div>
      </div>
    </section>
  );
}
