'use server'

import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'

export async function setRole(formData: FormData) {
    const client = await clerkClient()

    const isAdmin = await checkRole('admin')
    if (!isAdmin) {
        return { message: 'Not Authorized' }
    }

    try {
        const res = await client.users.updateUserMetadata(formData.get('id') as string, {
            publicMetadata: { accountType: formData.get('role') },
        })
        return { message: res.publicMetadata }
    } catch (err) {
        return { message: err }
    }
}

export async function removeRole(formData: FormData) {
    const client = await clerkClient()

    const isAdmin = await checkRole('admin')
    if (!isAdmin) {
        return { message: 'Not Authorized' }
    }

    try {
        const res = await client.users.updateUserMetadata(formData.get('id') as string, {
            publicMetadata: { accountType: null },
        })
        return { message: res.publicMetadata }
    } catch (err) {
        return { message: err }
    }
}