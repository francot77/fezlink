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
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/75 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
                <Link href="/" className="flex items-center gap-2 text-base font-semibold text-white transition hover:opacity-90">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm">FL</span>
                    <span>Fezlink</span>
                </Link>

                <div className="flex flex-1 items-center justify-end gap-2 text-sm font-medium text-white">
                    <div className="hidden items-center gap-1 sm:flex">
                        {Routes.map((ne) => (
                            <Link
                                className="rounded-lg px-3 py-2 transition hover:bg-white/10"
                                key={ne.path}
                                href={ne.path}
                            >
                                {ne.title}
                            </Link>
                        ))}
                    </div>

                    <SignedOut>
                        <div className="flex items-center gap-2">
                            <SignInButton mode="modal">
                                <button className="rounded-lg px-3 py-2 text-white transition hover:bg-white/10">Sign in</button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="rounded-lg bg-white px-3 py-2 font-semibold text-gray-900 transition hover:bg-gray-200">
                                    Get started
                                </button>
                            </SignUpButton>
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/dashboard"
                                className="rounded-lg bg-white px-3 py-2 font-semibold text-gray-900 transition hover:bg-gray-200"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={() => setShowSignOutModal(true)}
                                className="rounded-lg px-3 py-2 text-white transition hover:bg-white/10"
                            >
                                Sign out
                            </button>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </SignedIn>
                </div>
            </div>

            {showSignOutModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-gray-900 shadow-xl">
                        <p className="text-center text-base font-semibold text-gray-900">Cerrar sesión</p>
                        <p className="mt-2 text-center text-sm text-gray-600">¿Seguro que quieres salir de tu cuenta?</p>
                        <div className="mt-6 flex justify-center gap-3">
                            <SignOutButton redirectUrl="/">
                                <button
                                    onClick={() => setShowSignOutModal(false)}
                                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    Logout
                                </button>
                            </SignOutButton>
                            <button
                                onClick={() => setShowSignOutModal(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default NavBar
