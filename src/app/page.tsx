'use client'

import NavBar from '@/components/navbar'
import Image from 'next/image'
import Button from '@/components/button'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen px-4 md:px-8 lg:px-16 xl:px-20 text-white font-sans bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">


      <NavBar />


      <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-12 py-20 z-10">


        <section className="md:w-1/2 space-y-8 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Fast and Easy Link Management
          </h1>

          <ul className="space-y-4 text-lg md:text-xl text-gray-300">
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <span>👆🏻</span> Keep track of clicks
            </li>
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <span>🌍</span> See which country your links are accessed from
            </li>
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <Image src="/qr.webp" width={20} height={20} alt="QR icon" />
              Create your own QR codes
            </li>
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <span>🕊️</span> No ads, forever
            </li>
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <span>🔥</span> Create a BioPage for your socials
            </li>
          </ul>

          <Button
            title="Start Now!"
            customStyles={{
              backgroundColor: '#10B981', // Verde brillante
              color: 'white',
              width: '14rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onClick={() => router.push('/dashboard')}
          />
        </section>


        <section className="md:w-1/2 flex flex-col items-center mt-8 md:mt-0">
          <div className="relative group">
            <Image
              src="/hero.webp"
              width={256}
              height={256}
              alt="Acortador de enlaces"
              className="rounded-full shadow-2xl border-4 border-gray-700 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
          </div>
          <span className="mt-6 text-2xl md:text-3xl font-semibold text-center md:text-left text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Short your links in seconds
          </span>
        </section>
      </div>


      <div className="absolute top-10 left-10 w-60 h-60 bg-blue-500 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
    </main>
  )
}