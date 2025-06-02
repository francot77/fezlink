'use client'

import { usePathname, useRouter } from 'next/navigation'

export const SearchUsers = () => {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <div>
            <form className='bg-gray-500 p-2 rounded-md w-md justify-center items-center flex'
                onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.currentTarget
                    const formData = new FormData(form)
                    const queryTerm = formData.get('search') as string
                    router.push(pathname + '?search=' + queryTerm)
                }}
            >
                <label htmlFor="search">Search for users</label>
                <input id="search" name="search" type="text" className=' border-2 border-gray-500 bg-gray-600 m-1 p-1 rounded-md' />
                <button type="submit">🔍</button>
            </form>
        </div>
    )
}