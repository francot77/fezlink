'use client'

import NavBar from '@/components/navbar'
import Image from 'next/image'
import Button from '@/components/button'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-white font-bold bg-gradient-to-br from-gray-900 to-black relative">
      {/* Navbar */}
      <NavBar />

      {/* Contenido principal */}
      <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto gap-10 py-12 text-center md:text-left z-10">
        {/* Texto e ítems */}
        <section className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-6xl leading-tight">Fast and Easy Link</h1>

          <ul className="space-y-3 text-lg md:text-xl">
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <span>👆🏻</span> Lleva un registro de clicks
            </li>
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <span>🌍</span> Revisa desde qué país acceden a tus enlaces
            </li>
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <Image src="/qr.webp" width={20} height={20} alt="QR icon" />
              Crea tus propios códigos QR
            </li>
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <span>🕊️</span> Sin publicidad, para siempre
            </li>
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <span>🔥</span> Crea una BioPage para tus redes
            </li>
          </ul>

          {/* Botón personalizado */}
          <Button
            title="Comenzar ahora!"
            customStyles={{
              backgroundColor: 'green',
              color: 'white',
              width: '10em',
              marginTop: '10px',
            }}
            onClick={() => alert('Holis')}
          />
        </section>

        {/* Imagen y título secundario */}
        <section className="md:w-1/2 flex flex-col items-center mt-8 md:mt-0">
          <Image
            src="/hero.webp"
            width={256}
            height={256}
            alt="Acortador de enlaces"
            className="rounded-full shadow-xl border-4 shadow-white border-black-500"
          />
          <span className="mt-4 text-2xl md:text-3xl">Acorta tus enlaces en segundos</span>
        </section>
      </div>

      {/* Fondo decorativo */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full opacity-10 blur-2xl pointer-events-none"></div>
    </main>
  )
}