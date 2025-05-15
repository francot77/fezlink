/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { useUser } from "@clerk/nextjs";
import Spinner from '@/components/spinner';
import Button from '@/components/button';

const Profile: React.FC = () => {
    const { user } = useUser();

    if (!user) {
        return <div className='flex justify-center items-center w-full h-full flex-col gap-3'>
            <span>Cargando...</span>
            <Spinner color='white' />
        </div>;
    }

    return (
        <div className='w-full'>
            <h1>Perfil de usuario</h1>
            <div className='flex flex-row justify-around w-full mt-5'>
                <section>
                    <p><strong>Name:</strong> {user.firstName}</p>
                    <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress || "No email available"}</p>
                    <Button title='Cambiar contraseña' customStyles={{ backgroundColor: "red", margin: "1em" }} onClick={() => { }} />
                </section>
                <section>
                    <img className='w-25 rounded-full' src={user.imageUrl} alt="avatar" />
                </section>

            </div>
        </div>
    );
};

export default Profile;