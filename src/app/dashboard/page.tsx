'use client'
import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useUser } from "@clerk/nextjs";
//import { useRouter } from 'next/navigation';
import Spinner from '@/components/spinner';

const DashboardPage: React.FC = () => {
    const { renderButtons, renderSection, activeLink } = useDashboard()
    //const router = useRouter();
    const { isLoaded, } = useUser();
    if (!isLoaded) {
        return <div className='flex justify-center items-center w-full h-screen flex-col gap-3'>
            <span className='text-white'>Cargando...</span>
            <Spinner color='white' />
        </div>;
    }
    //if (!isSignedIn) return <div>No estás logueado</div>;
    //if (!user) router.push("/")
    return (
        <div className='flex justify-center items-center h-screen w-full flex-col text-white'>
            {/* <div className="absolute bottom-10 left-20 w-50 h-50 bg-blue-600 rounded-full opacity-10 blur-2xl"></div> */}
            <h1 className='m-3 text-4xl'>FezLink Dashboard</h1>
            <div className='flex flex-row md:min-w-4xl rounded-md min-h-1/2 border-3 border-gray-900 shadow-2xl shadow-blue-800 '>
                <section className='p-3 border-r-3 border-gray-900'>
                    <ul className='space-y-5 m-2'>
                        {renderButtons()}
                    </ul>
                </section>
                <section className='p-3 w-full'>
                    {renderSection(activeLink!)}
                </section>
            </div>
        </div>
    );
};

export default DashboardPage;