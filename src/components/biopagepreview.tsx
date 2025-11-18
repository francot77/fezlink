import { SelectedLink } from "@/types/globals";
import { SupportedLanguage } from "@/types/i18n";

/* eslint-disable @next/next/no-img-element */
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
  const translations: Record<SupportedLanguage, string> = {
    en: 'No links selected',
    es: 'No hay links seleccionados',
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-700 max-w-xs mx-auto mt-6 transform transition-all hover:scale-[1.02] ">

      <div style={{ backgroundColor: bgColor, color: textColor }} className="p-4 text-center min-h-[300px] flex flex-col items-center justify-start">

        <div className={`w-20 h-20 rounded-full overflow-hidden mb-3 ring-3 ring-[#${textColor}]`}>
          <img src={avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} alt="avatar" className="w-full h-full object-cover" />
        </div>

        <h2 className="text-xl font-bold mb-4">@{slug}</h2>

        {links.length > 0 ? (
          <ul className="space-y-2 w-full">
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={`https://${link.shortUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2 px-3 rounded-md text-center bg-white/10 hover:bg-white/20 transition"
                  style={{ color: textColor }}
                >
                  {link.label || link.shortUrl}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm opacity-70">{translations[language]}</p>
        )}
      </div>
    </div>
  );
};

export default BiopagePreview;
