/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { BioPageData } from './types';
import { getBackgroundImageStyles, getBaseColorStyle } from '@/utils/backgroundImageStyles';
import { Link as LinkIcon, Palette, UserCircle } from 'lucide-react';

interface Props {
  bioPage: BioPageData;
}

const CustomMarker = ({
  title,
  description,
  position,
  icon: Icon,
}: {
  title: string;
  description: string;
  position: string;
  icon: React.ElementType;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`absolute ${position} z-[60] group pointer-events-auto`}>
      <button
        onClick={toggleOpen}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`
          relative bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl
          flex flex-col overflow-hidden
          transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)
          cursor-pointer outline-none
          ${isOpen
            ? 'w-64 bg-black/90 ring-2 ring-emerald-500/30 rounded-[28px] p-5 items-start'
            : 'w-14 h-14 items-center justify-center rounded-[28px] hover:scale-110 hover:bg-black/80'
          }
        `}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4 w-full">
          <div className={`shrink-0 transition-colors duration-300 flex items-center justify-center ${isOpen ? 'text-emerald-400' : 'text-white w-full h-full'}`}>
            <Icon size={isOpen ? 20 : 24} />
          </div>

          <div
            className={`
              whitespace-nowrap overflow-hidden
              transition-opacity duration-300 delay-100
              ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
            `}
          >
            <span className="text-sm font-bold text-white uppercase tracking-wider block">
              {title}
            </span>
          </div>
        </div>

        <div
          className={`
            mt-3 text-left
            transition-all duration-500 ease-out
            ${isOpen ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 hidden'}
          `}
        >
          <div className="w-[200px]">
            <p className="text-xs leading-relaxed text-gray-300 font-medium">
              {description}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default function DemoRenderer({ bioPage }: Props) {
  const [showBadges, setShowBadges] = useState(true);

  const defaultDescription =
    'Descubre y comparte tus enlaces destacados desde un perfil moderno y adaptable.';

  const fallbackAvatar =
    'https://cdn.fezlink.com/avatars/Profile_avatar_placeholder_large.png';

  // Base styles (color or gradient)
  const pageBackgroundStyle: React.CSSProperties = {
    color: bioPage.textColor,
    ...getBaseColorStyle(bioPage.background?.base || '#000000'),
  };

  // Background image styles
  const backgroundImageStyle = getBackgroundImageStyles({
    imageUrl: bioPage.background?.image?.url,
    blur: bioPage.background?.image?.blur ?? 0,
    zoom: bioPage.background?.image?.zoom ?? 0,
    positionX: bioPage.background?.image?.positionX ?? 0,
    positionY: bioPage.background?.image?.positionY ?? 0,
  });

  return (
    <div
      className="w-full h-full min-h-full flex flex-col justify-center items-center p-4 md:p-8 overflow-hidden relative transition-all duration-500 group/container select-none"
      style={pageBackgroundStyle}
      onClick={() => setShowBadges(true)}
    >
      {/* Background Image Layer */}
      {bioPage.background?.image?.url && (
        <div className="absolute inset-0 bg-center bg-cover z-0 transition-all duration-500" style={backgroundImageStyle} />
      )}

      {/* Contrast Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-500" />

      {/* Customization Markers Layer */}
      {showBadges && (
        <div className="absolute inset-0 z-[60] pointer-events-none">
          <CustomMarker
            title="Fondo"
            description="Personaliza con colores, gradientes o tus propias imágenes de fondo."
            position="top-6 right-6"
            icon={Palette}
          />

          <CustomMarker
            title="Perfil"
            description="Sube tu mejor foto, añade tu nombre y una biografía que destaque."
            position="top-[20%] left-4 md:left-[5%]"
            icon={UserCircle}
          />

          <CustomMarker
            title="Enlaces"
            description="Botones ilimitados, iconos personalizados y estilos únicos."
            position="bottom-[20%] right-4 md:right-[5%]"
            icon={LinkIcon}
          />
        </div>
      )}

      {/* Toggle Badges Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowBadges(!showBadges);
        }}
        className="absolute top-4 left-4 z-50 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/90 text-xs font-medium px-4 py-2 rounded-full border border-white/20 transition-all shadow-lg pointer-events-auto"
      >
        {showBadges ? 'Ocultar guías' : 'Mostrar guías'}
      </button>

      {/* Content Container */}
      <div className="relative w-full max-w-4xl flex flex-col lg:grid lg:grid-cols-[1.1fr,0.9fr] gap-4 lg:gap-8 items-center z-20 px-2">

        {/* Profile Info */}
        <div className="flex flex-col items-center lg:items-start gap-3 text-center lg:text-left">
          <div
            className="relative h-24 w-24 md:h-40 md:w-40 rounded-full overflow-hidden border-4 shadow-2xl transition-transform hover:scale-105 duration-300 bg-gray-800"
            style={{
              borderColor: bioPage.textColor,
              boxShadow: `0 20px 40px ${bioPage.textColor}40`,
            }}
          >
            <img
              src={bioPage.avatarUrl || fallbackAvatar}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-2 px-2 md:px-0">
            <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight capitalize drop-shadow-lg leading-tight">
              @{bioPage.slug}
            </h1>
            <p className="text-sm md:text-lg opacity-90 max-w-xl font-medium drop-shadow-md leading-relaxed line-clamp-3 md:line-clamp-none">
              {bioPage.description || defaultDescription}
            </p>
          </div>
        </div>

        {/* Links Section */}
        <section className="w-full">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-6 shadow-2xl transition-transform hover:scale-[1.01] duration-500">
            <div className="flex items-center justify-between gap-3 mb-4 border-b border-white/10 pb-3">
              <h2 className="text-lg md:text-xl font-bold" style={{ color: bioPage.textColor }}>Enlaces</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md" style={{ color: bioPage.textColor }}>
                {bioPage.links.length} activos
              </span>
            </div>

            <ul className="space-y-3">
              {bioPage.links.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="group flex items-center gap-3 rounded-2xl bg-black/40 border border-white/10 p-3 md:p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 hover:shadow-xl w-full"
                  >
                    {/* Fake Icon Placeholder */}
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-white/20 transition-colors">
                      <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-current" style={{ color: bioPage.textColor }} />
                    </div>

                    <div className="flex-1 text-left">
                      <span
                        className="block text-sm md:text-lg font-bold transition-colors line-clamp-1"
                        style={{ color: bioPage.textColor }}
                      >
                        {link.label}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Branding Footer */}
          <div className="mt-6 flex justify-center items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-black">
              FL
            </div>
            <span className="text-xs font-medium tracking-wide" style={{ color: bioPage.textColor }}>
              Powered by FezLink
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
