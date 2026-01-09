'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { demoBiopages } from './data';
import DemoRenderer from './DemoRenderer';

export default function DemoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % demoBiopages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + demoBiopages.length) % demoBiopages.length);
  };

  const currentBiopage = demoBiopages[currentIndex];

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 py-8">
      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes simpleFade {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-simple-fade {
          animation: simpleFade 0.5s ease-out forwards;
        }
      `}</style>

      {/* Navigation Buttons */}
      <div className="absolute top-1/2 left-4 md:-left-16 -translate-y-1/2 z-30 hidden md:block">
        <button
          onClick={handlePrev}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
          aria-label="Previous demo"
        >
          <ChevronLeft size={32} />
        </button>
      </div>

      <div className="absolute top-1/2 right-4 md:-right-16 -translate-y-1/2 z-30 hidden md:block">
        <button
          onClick={handleNext}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
          aria-label="Next demo"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Carousel Content */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gray-900 aspect-[9/16] md:aspect-auto md:h-[800px] border border-white/10">
        <div
          key={currentIndex}
          className="absolute inset-0 w-full h-full animate-simple-fade"
        >
          <DemoRenderer bioPage={currentBiopage} />
        </div>
      </div>

      {/* Mobile Navigation Controls */}
      <div className="flex md:hidden justify-between items-center mt-6 px-4">
        <button
          onClick={handlePrev}
          className="p-3 rounded-full bg-white/10 border border-white/10 text-white"
        >
          <ChevronLeft size={24} />
        </button>
        
        {/* Indicators */}
        <div className="flex gap-2">
          {demoBiopages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-emerald-500 w-6'
                  : 'bg-gray-600 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-full bg-white/10 border border-white/10 text-white"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Desktop Indicators */}
      <div className="hidden md:flex justify-center gap-3 mt-8">
        {demoBiopages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-emerald-500 w-8'
                : 'bg-gray-600 w-3 hover:bg-gray-500'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
