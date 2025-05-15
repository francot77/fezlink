/* eslint-disable @next/next/no-img-element */
'use client'
import Spinner from "@/components/spinner";
import { use, useEffect, useState } from "react";

interface BioPageProps {
    params: Promise<{ slug: string }>;
}

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

export default function BioPage({ params }: BioPageProps) {
    const { slug } = use(params);
    const [bioPage, setBioPage] = useState<BioPage | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchFunc = async () => {
            try {
                const res = await fetch(`/api/biopage/${slug}`);
                const data = await res.json();
                setBioPage(data.biopage);
            } catch (err) {
                console.error("Error fetching biopage:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFunc();
    }, [slug]);

    if (isLoading) return <Spinner />;

    return (
        <main
            className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
            style={{ backgroundColor: bioPage?.backgroundColor, color: bioPage?.textColor }}
        >

            {bioPage?.avatarUrl && (
                <div className="mb-6">
                    <img
                        src={bioPage.avatarUrl}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full border-4 border-current"
                    />
                </div>
            )}


            <h1 className="text-3xl font-bold mb-8">
                {bioPage?.slug}
            </h1>


            <section className={`w-full max-w-md bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg `} style={{ boxShadow: `0 0 10px ${bioPage?.textColor}80` }}>
                <h2 className="text-xl font-semibold mb-4">Enlaces disponibles</h2>
                <ul className="space-y-3">
                    {bioPage?.links.map((link, index) => (
                        <li key={index}>
                            <a
                                href={`${link.shortUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200"
                                style={{ color: bioPage?.textColor }}
                            >
                                {link.label || link.shortUrl}
                            </a>
                        </li>
                    ))}
                </ul>
            </section>


            <footer className="mt-10 text-sm opacity-70">
                © {new Date().getFullYear()} Fezlink - Tu Acortador de Links 🐍
            </footer>
        </main>
    );
}