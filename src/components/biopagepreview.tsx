import { SelectedLink } from "@/types/globals";
import { SupportedLanguage } from "@/types/i18n";

/* eslint-disable @next/next/no-img-element */
const translations: Record<SupportedLanguage, string> = {
  en: 'No links selected',
  es: 'No hay links seleccionados',
};

const getSafeUrl = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

const BiopagePreview = ({
  bgColor,
  textColor,
  avatarUrl,
  slug,
  links,
  language = 'en'
}: {
  bgColor: string;
  textColor: string;
  avatarUrl: string;
  slug: string;
  links: SelectedLink[];
  language?: SupportedLanguage;
}) => {
  return (
    <div className="mt-6 w-full max-w-sm rounded-2xl border border-gray-700/80 bg-gray-900/70 p-4 shadow-xl shadow-black/40">
      <div className="overflow-hidden rounded-xl" style={{ backgroundColor: bgColor, color: textColor }}>
        <div className="relative flex flex-col items-center gap-3 px-6 py-8 text-center">
          <div
            className="h-20 w-20 overflow-hidden rounded-full border-4 shadow-lg"
            style={{ borderColor: textColor, boxShadow: `0 8px 30px ${textColor}40` }}
          >
            <img
              src={avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="text-xl font-bold">@{slug}</h2>
          <p className="text-sm opacity-70">Preview</p>
        </div>

        <div className="space-y-3 bg-black/10 px-4 pb-6 pt-2 backdrop-blur">
          {links.length > 0 ? (
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href={getSafeUrl(link.shortUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-lg bg-white/15 px-3 py-2 text-center text-sm font-semibold backdrop-blur transition hover:bg-white/25"
                    style={{ color: textColor }}
                  >
                    {link.label || link.shortUrl}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm opacity-80">{translations[language]}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiopagePreview;
