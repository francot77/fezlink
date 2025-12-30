/* eslint-disable @next/next/no-img-element */
"use client";

//import QRButton from "@/components/QRButton";
import { BioPageData } from "@/lib/biopage";

interface Props {
    slug: string;
    initialBioPage: BioPageData | null;
}

export default function BioPageClient({ initialBioPage }: Props) {
    const bioPage = initialBioPage;

    if (!bioPage) {
        return (
            <div className="text-red-400 p-4">
                Esta página no existe o ha sido eliminada.
            </div>
        );
    }

    const defaultDescription =
        "Descubre y comparte tus enlaces destacados desde un perfil moderno y adaptable.";

    const fallbackAvatar =
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";



    /* 👉 background del body (color o gradient base) */
    const pageBackgroundStyle: React.CSSProperties = {
        color: bioPage.textColor,
    };

    const backgroundBase = bioPage.background?.base;

    if (backgroundBase?.includes("gradient")) {
        pageBackgroundStyle.backgroundImage = backgroundBase;
    } else {
        pageBackgroundStyle.backgroundColor = backgroundBase || "#000000";
    }
    const positionX = bioPage.background?.image?.positionX ?? 0;
    const positionY = bioPage.background?.image?.positionY ?? 0;
    const backgroundZoom = bioPage.background?.image?.zoom ?? 0;
    const backgroundBlur = bioPage.background?.image?.blur ?? 0;
    return (
        <main
            className="min-h-screen flex items-center justify-center px-4 py-10"
            style={pageBackgroundStyle}
        >
            <div className="w-full max-w-4xl">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                    {bioPage.background?.image?.url && (
                        <>
                            <div
                                className="absolute inset-0 bg-center bg-cover scale-110 z-0"
                                style={{
                                    backgroundImage: `url(${bioPage.background?.image?.url})`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: 'cover',

                                    // offsets reales, predecibles
                                    backgroundPosition: `${50 + (positionX ?? 0)}% ${50 + (positionY ?? 0)}%`,

                                    // blur no afecta posición
                                    filter: `blur(${backgroundBlur}px)`,

                                    // zoom único y consistente
                                    transform: `scale(${1 + (backgroundZoom ?? 0) / 100})`,
                                    transformOrigin: 'center',
                                }}

                            />

                        </>
                    )}

                    {/* Overlay contraste */}
                    <div className="absolute inset-0 bg-black/50 z-10" />

                    {/* Contenido */}
                    <div className="relative grid gap-8 lg:grid-cols-[1.1fr,0.9fr] p-8 md:p-12 items-center z-20">
                        <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
                            <div
                                className="relative h-32 w-32 rounded-full overflow-hidden border-4 shadow-xl"
                                style={{
                                    borderColor: bioPage.textColor,
                                    boxShadow: `0 20px 40px ${bioPage.textColor}30`,
                                }}
                            >
                                <img
                                    src={bioPage.avatarUrl || fallbackAvatar}
                                    alt="Avatar"
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold tracking-tight">
                                    @{bioPage.slug}
                                </h1>
                                <p className="text-sm text-white/80 max-w-xl">
                                    {bioPage.description || defaultDescription}
                                </p>
                            </div>
                        </div>

                        <section className="w-full">
                            {bioPage.links.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80 shadow-lg">
                                    <h2 className="text-xl font-semibold mb-2">
                                        No hay links para mostrar
                                    </h2>
                                    <p className="text-sm">
                                        Agrega enlaces desde tu panel para mostrarlos aquí.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <h2 className="text-xl font-semibold">
                                            Enlaces disponibles
                                        </h2>
                                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                                            {bioPage.links.length} links
                                        </span>
                                    </div>

                                    <ul className="space-y-3">
                                        {bioPage.links.map((link, index) => (
                                            <li key={index}>
                                                <div className="flex items-center gap-3 rounded-xl bg-black/40 border border-white/10 p-3 transition hover:border-white/30">
                                                    <div className="flex-1 text-center">
                                                        <a
                                                            href={link.shortUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block text-lg  font-semibold"
                                                            style={{ color: bioPage.textColor }}
                                                        >
                                                            {link.label}
                                                        </a>

                                                    </div>


                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>
                    </div>
                </div>

                <footer className="mt-8 text-center text-sm text-white/70">
                    © {new Date().getFullYear()} Fezlink - Tu Acortador de Links 🐍
                </footer>
            </div>
        </main>
    );
}
