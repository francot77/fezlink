/* eslint-disable @next/next/no-img-element */
'use client'
import QRButton from "@/components/QRButton";
import Spinner from "@/components/spinner";
import { use, useEffect, useState } from "react";

interface Link {
    shortUrl: string;
    label: string;
}

interface BioPage {
    slug: string;
    links: Link[];
    textColor: string;
    backgroundColor: string;
    avatarUrl: string;
}

export default function BioPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [bioPage, setBioPage] = useState<BioPage | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFunc = async () => {
            try {
                const res = await fetch(`/api/biopage/${slug}`);
                if (!res.ok) throw new Error("No se encontró la página");
                const data = await res.json();
                setBioPage(data.biopage);
            } catch (err) {
                setError("Esta página no existe o ha sido eliminada.");
                console.error("Error fetching biopage:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFunc();
    }, [slug]);

    if (isLoading) return <div className="w-full h-screen flex flex-col justify-center items-center text-white gap-2"><h1>Loading...</h1><Spinner color="white" /></div>;
    if (error) return <div className="text-red-400 p-4">{error}</div>;
    if (!bioPage) return null;

    const isGradient = bioPage.backgroundColor?.includes("gradient")
    const qrButtonTextColor = isGradient ? '#0f172a' : bioPage.backgroundColor

    return (
        <main
            className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-10"
            style={
                isGradient
                    ? { backgroundImage: bioPage.backgroundColor, color: bioPage.textColor }
                    : { backgroundColor: bioPage.backgroundColor, color: bioPage.textColor }
            }
        >
            <div className="w-full max-w-4xl">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/30 pointer-events-none" />
                    <div className="relative grid gap-8 lg:grid-cols-[1.1fr,0.9fr] p-8 md:p-12 items-center">
                        <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
                            <div
                                className="relative h-32 w-32 rounded-full overflow-hidden border-4 shadow-xl"
                                style={{
                                    borderColor: bioPage.textColor,
                                    boxShadow: `0 20px 40px ${bioPage.textColor}30`,
                                }}
                            >
                                <img
                                    src={
                                        bioPage.avatarUrl ||
                                        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                                    }
                                    alt="Avatar"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold tracking-tight">@{bioPage.slug}</h1>
                                <p className="text-sm text-white/80 max-w-xl">
                                    Descubre y comparte tus enlaces destacados desde un perfil moderno y adaptable.
                                </p>
                            </div>
                        </div>

                        <section className="w-full">
                            {bioPage.links.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80 shadow-lg">
                                    <h2 className="text-xl font-semibold mb-2">No hay links para mostrar</h2>
                                    <p className="text-sm">Agrega enlaces desde tu panel para mostrarlos aquí.</p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <h2 className="text-xl font-semibold">Enlaces disponibles</h2>
                                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                                            {bioPage.links.length} links
                                        </span>
                                    </div>
                                    <ul className="space-y-3">
                                        {bioPage.links.map((link, index) => (
                                            <li key={index}>
                                                <div className="flex items-center gap-3 rounded-xl bg-black/40 border border-white/10 p-3 transition hover:border-white/30">
                                                    <div className="flex-1 text-left">
                                                        <a
                                                            href={`${link.shortUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block text-lg font-semibold"
                                                            style={{ color: bioPage.textColor }}
                                                        >
                                                            {link.label || link.shortUrl}
                                                        </a>
                                                        <p className="text-xs text-white/60 break-all">{link.shortUrl}</p>
                                                    </div>
                                                    <QRButton
                                                        url={`${process.env.BASE_URL}/${bioPage.slug}`}
                                                        backgroundColor={bioPage.textColor}
                                                        textColor={qrButtonTextColor}
                                                    />
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
    )
}