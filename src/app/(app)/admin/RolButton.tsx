'use client'

import { toast } from 'sonner'
import { setRole } from './_actions'

export function RoleButtons({ userId }: { userId: string }) {


    const handleSetRole = async (role: string) => {
        const formData = new FormData()
        formData.append('id', userId)
        formData.append('role', role)
        const res = await setRole(formData)
        if (res.message !== 'error') toast.success("Rol asignado: " + role, { richColors: true, position: "top-center" })
    }


    return (
        <div className="space-y-2 space-x-2">
            <button
                onClick={() => handleSetRole('premium')}
                className="bg-red-600 text-white px-4 py-1.5 rounded"
            >
                Make Premium🔥
            </button>
            <button
                onClick={() => handleSetRole('free')}
                className="bg-green-600 text-white px-4 py-1.5 rounded"
            >
                Make Free
            </button>
        </div>
    )
}
