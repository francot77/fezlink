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
        <nav>
            <div className="flex flex-row gap-5 fixed text-md justify-center items-center left-0 top-2 z-50 w-full">
                {/* Navbar para usuarios no logueados */}
                <SignedOut>
                    {Routes.map((ne) => (
                        <Link className="hover:scale-105" key={ne.path} href={ne.path}>{ne.title}</Link>
                    ))}
                    <SignInButton mode="modal" />
                    <SignUpButton mode="modal" />
                </SignedOut>

                {/* Navbar para usuarios logueados */}
                <SignedIn>
                    <div className="flex gap-4 items-center">
                        <Link href="/dashboard">Dashboard</Link>

                        {/* Botón que abre la modal */}
                        <button
                            onClick={() => setShowSignOutModal(true)}
                            className="text-sm border border-black px-3 py-1 bg-red-500 rounded-md hover:text-black hover:bg-neutral-100 transition"
                        >
                            Sign out
                        </button>

                        <UserButton />
                    </div>
                </SignedIn>
            </div>

            {/* Modal de confirmación */}
            {showSignOutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
                    <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center gap-3 w-64">
                        <p className="text-sm text-gray-800 text-center">Are you sure?</p>
                        <div className="flex gap-3 mt-2">
                            <SignOutButton>
                                <button
                                    onClick={() => setShowSignOutModal(false)}
                                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Logout
                                </button>
                            </SignOutButton>
                            <button
                                onClick={() => setShowSignOutModal(false)}
                                className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 bg-black hover:text-black"
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
