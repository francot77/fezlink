import { SelectedLink } from '@/types/globals';
import { SupportedLanguage } from '@/types/i18n';

/* eslint-disable @next/next/no-img-element */
const BiopagePreview = ({
  bgColor,
  textColor,
  avatarUrl,
  slug,
  links,
  description,
  language = 'en',
  backgroundImageUrl,
  backgroundBlur,
  backgroundZoom,
  backgroundPositionX,
  backgroundPositionY
}: {
  backgroundPositionX?: number;
  backgroundPositionY?: number;
  backgroundZoom?: number;
  bgColor: string;
  textColor: string;
  avatarUrl: string;
  slug: string;
  links: SelectedLink[];
  description?: string;
  language?: SupportedLanguage;
  backgroundImageUrl?: string;
  backgroundBlur: number;
}) => {
  const translations: Record<SupportedLanguage, string> = {
    en: 'No links selected',
    es: 'No hay links seleccionados',
  };

  /* ---------- Background base (color o gradient) ---------- */
  const baseStyle: React.CSSProperties = {
    color: textColor,
  };

  if (bgColor?.startsWith('linear-gradient')) {
    baseStyle.backgroundImage = bgColor;
  } else {
    baseStyle.backgroundColor = bgColor || '#000000';
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-700 max-w-xs mx-auto mt-6 bg-gray-900/40">
      <div
        className="relative min-h-[320px] overflow-hidden"
        style={baseStyle}
      >
        {/* Imagen de fondo con blur */}
        {backgroundImageUrl && (
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${backgroundImageUrl})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',

              // offsets reales, predecibles
              backgroundPosition: `${50 - (backgroundPositionX ?? 0)}% ${50 - (backgroundPositionY ?? 0)}%`,

              // blur no afecta posición
              filter: `blur(${backgroundBlur}px)`,

              // zoom único y consistente
              transform: `scale(${1 + (backgroundZoom ?? 0) / 100})`,
              transformOrigin: 'center',
            }}

          />
        )}


        {/* Overlay de contraste */}
        {backgroundImageUrl && (
          <div className="absolute inset-0 bg-black/40 z-10" />
        )}

        {/* Contenido */}
        <div className="relative z-20 p-5 text-center flex flex-col items-center justify-start">
          <div
            className="w-24 h-24 rounded-full overflow-hidden mb-4"
            style={{ boxShadow: `0 0 0 3px ${textColor}` }}
          >
            <img
              src={
                avatarUrl ||
                'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
              }
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-2xl font-bold mb-3">@{slug}</h2>

          <p className="text-sm opacity-80 mb-3 max-w-xs">
            {description?.trim() ||
              'Descubre y comparte tus enlaces destacados desde un perfil moderno y adaptable.'}
          </p>

          {links.length > 0 ? (
            <ul className="space-y-2 w-full">
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href={`https://${link.shortUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 px-3 rounded-lg text-center bg-white/10 hover:bg-white/20 transition"
                    style={{ color: textColor }}
                  >
                    {link.label || link.shortUrl}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm opacity-70">
              {translations[language]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiopagePreview;
