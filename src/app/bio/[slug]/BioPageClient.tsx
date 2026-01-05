/* eslint-disable @next/next/no-img-element */
"use client";

import { BioPageData } from "@/lib/biopage";
import { getBackgroundImageStyles, getBaseColorStyle } from "@/utils/backgroundImageStyles";

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

    // Estilos base del page (color o gradient)
    const pageBackgroundStyle: React.CSSProperties = {
        color: bioPage.textColor,
        ...getBaseColorStyle(bioPage.background?.base || '#000000'),
    };

    // Estilos de la imagen de fondo (usando utilidad compartida)
    const backgroundImageStyle = getBackgroundImageStyles({
        imageUrl: bioPage.background?.image?.url,
        blur: bioPage.background?.image?.blur ?? 0,
        zoom: bioPage.background?.image?.zoom ?? 0,
        positionX: bioPage.background?.image?.positionX ?? 0,
        positionY: bioPage.background?.image?.positionY ?? 0,
    });

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4 py-10"
            style={pageBackgroundStyle}
        >
            <div className="w-full max-w-4xl">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                    {/* Background Image Layer */}
                    {bioPage.background?.image?.url && (
                        <div
                            className="absolute inset-0 bg-center bg-cover z-0"
                            style={backgroundImageStyle}
                        />
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
                                                            className="block text-lg font-semibold"
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
                    © {new Date().getFullYear()} Fezlink - Tu Acortador de Links 🚀
                </footer>
            </div>
        </main>
    );
}