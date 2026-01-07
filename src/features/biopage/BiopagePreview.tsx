/* eslint-disable @next/next/no-img-element */
import { SelectedLink } from '@/types/globals';
import { SupportedLanguage } from '@/types/i18n';
import { getBackgroundImageStyles, getBaseColorStyle } from '@/utils/backgroundImageStyles';

interface BiopagePreviewProps {
  bgColor: string;
  textColor: string;
  avatarUrl: string;
  slug: string;
  links: SelectedLink[];
  description: string;
  language: SupportedLanguage;
  backgroundImageUrl?: string;
  backgroundBlur: number;
  backgroundZoom: number;
  backgroundPositionX: number;
  backgroundPositionY: number;
}

export default function BiopagePreview({
  bgColor,
  textColor,
  avatarUrl,
  slug,
  links,
  description,
  backgroundImageUrl,
  backgroundBlur,
  backgroundZoom,
  backgroundPositionX,
  backgroundPositionY,
}: BiopagePreviewProps) {
  const fallbackAvatar =
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541';

  const defaultDescription =
    'Descubre y comparte tus enlaces destacados desde un perfil moderno y adaptable.';

  // Estilos base (color o gradient) - MISMO que BioPageClient
  const baseStyle: React.CSSProperties = {
    color: textColor,
    ...getBaseColorStyle(bgColor),
  };

  // Estilos de imagen - MISMO que BioPageClient
  const backgroundImageStyle = getBackgroundImageStyles({
    imageUrl: backgroundImageUrl,
    blur: backgroundBlur,
    zoom: backgroundZoom,
    positionX: backgroundPositionX,
    positionY: backgroundPositionY,
  });

  return (
    <div
      className="w-full flex items-center justify-center py-6 flex-col rounded-lg"
      style={baseStyle}
    >
      {/* Mobile Preview Frame */}
      <div className="mx-auto w-full max-w-[320px] aspect-[9/16] rounded-3xl border-3 border-gray-800 shadow-2xl overflow-hidden">
        <div className="h-full w-full overflow-y-auto">
          <div className="relative min-h-full flex items-center justify-center p-6">
            {/* Background Image Layer */}
            {backgroundImageUrl && (
              <div
                className="absolute inset-0 bg-center bg-cover z-0"
                style={backgroundImageStyle}
              />
            )}

            {/* Overlay contraste */}
            <div className="absolute inset-0 bg-black/50 z-10" />

            {/* Contenido */}
            <div className="relative z-20 w-full space-y-6">
              {/* Avatar & Info */}
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className="relative h-20 w-20 rounded-full overflow-hidden border-2 shadow-lg"
                  style={{
                    borderColor: textColor,
                    boxShadow: `0 10px 20px ${textColor}30`,
                  }}
                >
                  <img
                    src={avatarUrl || fallbackAvatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <h1 className="text-xl font-bold tracking-tight">@{slug || 'username'}</h1>
                  <p className="text-xs text-white/80 px-2">{description || defaultDescription}</p>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-2">
                {links.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-white/80 text-xs">
                    No hay links para mostrar
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white/90">Enlaces</span>
                      <span className="text-xs text-white/60">{links.length}</span>
                    </div>
                    {links.slice(0, 5).map((link, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-black/40 border border-white/10 p-2 text-center"
                      >
                        <span className="text-xs font-semibold" style={{ color: textColor }}>
                          {link.label}
                        </span>
                      </div>
                    ))}
                    {links.length > 5 && (
                      <div className="text-center text-xs text-white/60">
                        +{links.length - 5} más
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Label */}
      <div className="mt-3 text-center">
        <span className="text-xs text-gray-400">Vista previa • 320x568px</span>
      </div>
    </div>
  );
}
