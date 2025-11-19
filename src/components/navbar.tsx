'use client'

import Link from "next/link"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, SignOutButton } from "@clerk/nextjs"
import { useState } from "react"

type NavElement = {
    title: string
    path: string
}

const NavBar = () => {
    const Routes: NavElement[] = [
        { title: "Home", path: "/" },
        { title: "Pricing", path: "/pricing" }
    ]

    const [showSignOutModal, setShowSignOutModal] = useState(false)

    return (
        <nav className="fixed inset-x-0 top-0 z-50">
            <div className="mx-auto max-w-6xl px-4 pt-4 md:px-8">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/70 px-4 py-3 shadow-2xl backdrop-blur-xl">
                    <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white transition hover:opacity-90">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-black font-bold shadow-lg">
                            FL
                        </span>
                        <div className="leading-tight">
                            <p>Fezlink</p>
                            <span className="text-xs text-white/60">Short links, clear insights</span>
                        </div>
                    </Link>

                    <div className="flex flex-1 items-center justify-end gap-3 text-sm font-medium text-white">
                        <div className="hidden items-center gap-3 sm:flex">
                            {Routes.map((ne) => (
                                <Link
                                    className="rounded-lg px-3 py-2 transition hover:bg-white/10 hover:text-white"
                                    key={ne.path}
                                    href={ne.path}
                                >
                                    {ne.title}
                                </Link>
                            ))}
                        </div>

                        {/* Navbar para usuarios no logueados */}
                        <SignedOut>
                            <div className="flex items-center gap-2">
                                <SignInButton mode="modal">
                                    <button className="rounded-xl border border-white/20 px-3 py-2 text-white transition hover:border-white/40 hover:bg-white/10">
                                        Sign in
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <button className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-2 font-semibold text-gray-900 shadow-lg transition hover:shadow-emerald-500/30">
                                        Get started
                                    </button>
                                </SignUpButton>
                            </div>
                        </SignedOut>

                        {/* Navbar para usuarios logueados */}
                        <SignedIn>
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard"
                                    className="hidden rounded-lg px-3 py-2 transition hover:bg-white/10 hover:text-white sm:block"
                                >
                                    Dashboard
                                </Link>

                                {/* Botón que abre la modal */}
                                <button
                                    onClick={() => setShowSignOutModal(true)}
                                    className="rounded-xl border border-red-400/40 px-3 py-2 text-sm text-red-100 transition hover:border-red-300 hover:bg-red-500/10"
                                >
                                    Sign out
                                </button>

                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </SignedIn>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación */}
            {showSignOutModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-gray-900 shadow-2xl">
                        <p className="text-center text-sm text-gray-700">¿Seguro que quieres cerrar sesión?</p>
                        <div className="mt-4 flex justify-center gap-3">
                            <SignOutButton>
                                <button
                                    onClick={() => setShowSignOutModal(false)}
                                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                                >
                                    Logout
                                </button>
                            </SignOutButton>
                            <button
                                onClick={() => setShowSignOutModal(false)}
                                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default NavBar
