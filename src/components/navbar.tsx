'use client'

import Button from "./button"
import { SignedIn, SignInButton, SignedOut, SignUpButton, UserButton } from "@clerk/nextjs"
//import { useState } from "react"
type NavElement = {
    title: string,
    path: string,
    isButton?: boolean
    color?: string,
    styles?: object,
    function?: () => void
}

const NavBar = () => {
    //const [activeLink, setActiveLink] = useState("Home")
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
        <div className="flex flex-row gap-5 fixed justify-center items-center left-0 top-2 w-full ">
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
                    <a href="/dashboard" className="text-sm underline">Dashboard</a>
                    <UserButton />
                </div>
                {/* <UserButton /> */}
            </SignedIn>
        </div>
    </nav>
}


export default NavBar;