import { redirect } from 'next/navigation'
import { checkRole } from '@/utils/roles'
import { SearchUsers } from './SearchUsers'
import { clerkClient } from '@clerk/nextjs/server'
import { RoleButtons } from './RolButton'

export default async function AdminDashboard(params: {
    searchParams: Promise<{ search?: string }>
}) {
    if (!checkRole('admin')) {
        redirect('/')
    }




    const query = (await params.searchParams).search

    const client = await clerkClient()

    const users = query ? (await client.users.getUserList({ query })).data : []

    return (
        <div className='flex p-2 h-screen  justify-center items-center flex-col text-white'>
            <p>Admin Panel</p>

            <SearchUsers />

            {users.map((user) => {
                return (
                    <div key={user.id} className='bg-gray-500 max-w-md p-2 rounded-md mt-4 w-full justify-center flex items-center flex-col'>
                        <div>
                            {user.firstName} {user.lastName}
                        </div>

                        <div>
                            {
                                user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
                                    ?.emailAddress
                            }
                        </div>

                        <div>Tipo de cuenta: {user.publicMetadata.accountType as string}</div>

                        <RoleButtons userId={user.id} />
                    </div>
                )
            })}
        </div>
    )
}