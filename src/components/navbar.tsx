'use client'

import Link from "next/link"
import Button from "./button"
import { SignedIn, SignInButton, SignedOut, SignUpButton, UserButton } from "@clerk/nextjs"
type NavElement = {
    title: string,
    path: string,
    isButton?: boolean
    color?: string,
    styles?: object,
    function?: () => void
}

const NavBar = () => {
    const Routes: NavElement[] = [{
        title: "Home",
        path: "/"
    },
    {
        title: "Solutions",
        path: "/solutions"
    },
    {
        title: "Pricing",
        path: "/pricing"
    }
    ]


    return <nav>
        <div className="flex flex-row gap-5 fixed justify-center items-center left-0 top-2 z-50 w-full ">
            {Routes.map((ne) => {
                if (ne.isButton) return <Button key={ne.title} title={ne.title} onClick={ne.function!} customStyles={ne.styles!} />
                return <div key={ne.path}>{ne.title}</div>
            })}
            <SignedOut>
                <SignInButton mode="modal" />
                <SignUpButton mode="modal" />
            </SignedOut>
            <SignedIn>
                <div className="flex gap-4 items-center">
                    <Link href="/dashboard" className="text-sm underline">Dashboard</Link>
                    <UserButton />
                </div>
            </SignedIn>
        </div>
    </nav>
}


export default NavBar;