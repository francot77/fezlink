'use client'
import QRButton from "@/components/QRButton";
import Spinner from "@/components/spinner";
import Image from 'next/image';
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

    if (isLoading) return <Spinner />;
    if (error) return <div className="text-red-400 p-4">{error}</div>;
    if (!bioPage) return null;

    return (
        <main
            className="flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center"
            style={{ backgroundColor: bioPage.backgroundColor, color: bioPage.textColor }}
        >


            {bioPage.avatarUrl && (
                <div className="mb-6">
                    <Image
                        src={bioPage.avatarUrl}
                        alt="Avatar"
                        width={96}
                        height={96}
                        className="rounded-full border-4 border-current"
                    />
                </div>
            )}


            <h1 className="text-3xl font-bold mb-8">
                {bioPage.slug}
            </h1>


            <section
                className="w-full max-w-md bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg"
                style={{ boxShadow: `0 0 10px ${bioPage.textColor}80` }}
            >
                <h2 className="text-xl font-semibold mb-4">Enlaces disponibles</h2>
                <ul className="space-y-3">
                    {bioPage.links.map((link, index) => (
                        <li key={index}>
                            <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
                                <a
                                    href={`${link.shortUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center w-full"
                                    style={{ color: bioPage.textColor }}
                                >
                                    {link.label || link.shortUrl}
                                </a>
                                <QRButton url={`${process.env.BASE_URL}/${bioPage.slug}`} backgroundColor={bioPage.textColor} textColor={bioPage.backgroundColor} />
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <footer className="mt-10 text-sm text-gray-400">
                © {new Date().getFullYear()} Fezlink - Tu Acortador de Links 🐍
            </footer>
        </main>
    );
}