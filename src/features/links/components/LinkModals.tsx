'use client';

import { useState } from 'react';
import Modal from '@/shared/ui/Modal';
import ClicksGlobe from '@/components/Globe';
import { COUNTRY_NAMES } from '@/lib/countryNames';
import { Link } from '@/hooks/useLinks';
import { Badge } from '@/shared/ui';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface LinkModalsProps {
    selectedLink: Link | null;
    modalType: 'stats' | 'delete' | null;
    deleteInput: string;
    setDeleteInput: (v: string) => void;
    deleteLink: (id: string, twoFactorCode?: string) => Promise<void>;
    closeModal: () => void;
    countries: { country: string; clicksCount: number }[];
    hasCountries: boolean;
    totalClicksByCountry: number;
}

const LinkModals: React.FC<LinkModalsProps> = ({
    selectedLink,
    modalType,
    deleteInput,
    setDeleteInput,
    deleteLink,
    closeModal,
    countries,
    hasCountries,
    totalClicksByCountry,
}) => {
    const { data: session } = useSession();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [forceShowOtp, setForceShowOtp] = useState(false);

    // Reset state when modal closes
    if (!modalType || !selectedLink) {
        if (otp) setOtp('');
        if (loading) setLoading(false);
        if (forceShowOtp) setForceShowOtp(false);
        return null;
    }

    const isStats = modalType === 'stats';
    const isTwoFactorEnabled = session?.user?.isTwoFactorEnabled || false;

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteLink(selectedLink.id, otp);
        } catch (error: any) {
            if (error.message === '2FA_REQUIRED') {
                toast.error('Security Check: Please enter your 2FA code');
                setForceShowOtp(true);
            } else if (error.message === 'INVALID_2FA') {
                toast.error('Invalid 2FA code');
            } else {
                toast.error('Failed to delete link');
            }
        } finally {
            setLoading(false);
        }
    };

    const countryCodeToFlag = (code: string) => {
        if (code.length !== 2) return '🏳️';
        const base = 127397;
        return String.fromCodePoint(
            ...code
                .toUpperCase()
                .split('')
                .map((c) => base + c.charCodeAt(0))
        );
    };

    return (
        <Modal
            isOpen
            title={isStats ? 'Métricas del link' : 'Borrar Link'}
            isStats={isStats}
            onCancel={closeModal}
            onAccept={modalType === 'delete' ? handleDelete : closeModal}
            description={
                isStats ? (
                    // ... (existing stats content) ...
                    <div className="space-y-4 text-left text-gray-200">
                        <div className="grid gap-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-gray-400">Link original</p>
                                <a
                                    href={selectedLink.destinationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="break-all text-sm font-medium text-blue-300 hover:text-blue-200"
                                >
                                    {selectedLink.destinationUrl}
                                </a>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-gray-400">Link acortado</p>
                                <a
                                    href={selectedLink.shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="break-all text-sm font-medium text-blue-300 hover:text-blue-200"
                                >
                                    {selectedLink.shortUrl}
                                </a>
                            </div>
                            <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
                                <Badge variant="blue">ID: {selectedLink.id}</Badge>
                                <Badge variant="emerald">Clicks totales: {totalClicksByCountry}</Badge>
                                {hasCountries && <Badge variant="amber">Países detectados: {countries.length}</Badge>}
                            </div>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 shadow-inner">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">Mapa de clics</p>
                                        <h3 className="text-lg font-semibold text-white">Distribución global</h3>
                                    </div>
                                    {hasCountries && <Badge variant="emerald">{totalClicksByCountry} clics en total</Badge>}
                                </div>
                                <div className="mt-4 h-[280px] sm:h-[340px] lg:h-[380px]">
                                    {hasCountries ? (
                                        <ClicksGlobe countries={countries} />
                                    ) : (
                                        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/60 text-center text-gray-400">
                                            No se registraron clics para este enlace aún.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 shadow-inner scrollbar-thin ">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">Detalle por país</p>
                                        <h3 className="text-lg font-semibold text-white">Clics por país</h3>
                                    </div>
                                    {hasCountries && <Badge variant="blue">{countries.length} países</Badge>}
                                </div>
                                {hasCountries ? (
                                    <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                                        {countries.map((country) => (
                                            <div
                                                key={country.country}
                                                className="flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-200">
                                                        {countryCodeToFlag(country.country)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{country.country}</p>
                                                        <p className="text-xs text-gray-400">{COUNTRY_NAMES[country.country]}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="gray" className="text-sm">{country.clicksCount}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-lg border border-dashed border-gray-700 bg-gray-900/60 p-4 text-sm text-gray-400">
                                        Aún no hay datos de países para este enlace.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center gap-4 text-gray-200">
                        <div className="text-center space-y-2">
                            <p className="text-lg">¿Está seguro que desea borrar el link?</p>
                            <p className="text-red-400 font-mono text-sm bg-red-500/10 px-2 py-1 rounded border border-red-500/20">{selectedLink.shortUrl}</p>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Escribe <span className="text-white font-bold">DELETE</span> para confirmar</label>
                                <input
                                    value={deleteInput}
                                    required
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    className="w-full p-3 bg-gray-800/50 rounded-lg text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-gray-600"
                                    placeholder="DELETE"
                                />
                            </div>

                            {(isTwoFactorEnabled || forceShowOtp) && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="flex items-center gap-2 text-sm text-cyan-400">
                                        <ShieldCheck size={14} />
                                        Código de Autenticación (2FA)
                                    </label>
                                    <input
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full p-3 bg-gray-800/50 rounded-lg text-white border border-cyan-900/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono tracking-widest text-center text-lg placeholder:text-gray-700"
                                        placeholder="000000"
                                        maxLength={6}
                                        autoFocus={forceShowOtp}
                                    />
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Loader2 className="animate-spin h-4 w-4" />
                                Verificando y eliminando...
                            </div>
                        )}
                    </div>
                )
            }
        />
    );
};

export default LinkModals;
