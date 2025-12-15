/**
 * Zhanguo Qi - Cinematic Intro Screen
 * Kingdom anime aesthetic - dark, political, war-themed
 */

import { useState, useEffect } from 'react';

interface IntroScreenProps {
  onComplete: () => void;
}

// Pre-generate random positions for embers
function generateEmberPositions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: (i * 37 + 13) % 100, // Pseudo-random but deterministic
    top: (i * 53 + 7) % 100,
    delay: (i * 0.7) % 5,
    duration: 5 + (i * 0.3) % 5,
  }));
}

const EMBER_POSITIONS = generateEmberPositions(20);

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState(0);
  const [canSkip, setCanSkip] = useState(false);

  // Start the intro and trigger music
  const handleStart = () => {
    setStarted(true);
  };

  useEffect(() => {
    if (!started) return;

    // Allow skipping after 1 second
    const skipTimer = setTimeout(() => setCanSkip(true), 1000);

    // Phase timings for the intro sequence
    const timings = [
      { delay: 500, phase: 1 },    // Fade in background
      { delay: 2000, phase: 2 },   // First text
      { delay: 4500, phase: 3 },   // Second text
      { delay: 7000, phase: 4 },   // Third text
      { delay: 9500, phase: 5 },   // Title reveal
      { delay: 13000, phase: 6 },  // Subtitle
      { delay: 16000, phase: 7 },  // Final fade to menu
    ];

    const timers = timings.map(({ delay, phase }) =>
      setTimeout(() => setPhase(phase), delay)
    );

    // Auto-complete after intro
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 18000);

    return () => {
      clearTimeout(skipTimer);
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [started, onComplete]);

  const handleSkip = () => {
    if (canSkip) {
      onComplete();
    }
  };

  // Initial "Click to Begin" screen
  if (!started) {
    return (
      <div 
        className="fixed inset-0 bg-black z-50 overflow-hidden cursor-pointer flex items-center justify-center"
        onClick={handleStart}
      >
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/20 to-black" />
        
        {/* Floating embers in background */}
        <div className="absolute inset-0 overflow-hidden opacity-50">
          {EMBER_POSITIONS.slice(0, 10).map((ember) => (
            <div
              key={ember.id}
              className="absolute w-1 h-1 bg-orange-500/60 rounded-full animate-float"
              style={{
                left: `${ember.left}%`,
                top: `${ember.top}%`,
                animationDelay: `${ember.delay}s`,
                animationDuration: `${ember.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-amber-100 mb-4 tracking-wider">
            ⚔️
          </h1>
          <h2 className="text-2xl md:text-3xl font-light text-amber-100/80 tracking-[0.5em] uppercase mb-8">
            Zhanguo Qi
          </h2>
          <div className="animate-pulse">
            <p className="text-amber-200/60 text-lg tracking-widest uppercase">
              Click to Begin
            </p>
          </div>
          <p className="text-stone-600 text-xs mt-8">
            🎵 Music will play
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black z-50 overflow-hidden cursor-pointer"
      onClick={handleSkip}
    >
      {/* Animated Background - War atmosphere */}
      <div 
        className={`absolute inset-0 transition-opacity duration-[3000ms] ${
          phase >= 1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/30 to-black" />
        
        {/* Animated fog/smoke effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900/20 to-transparent animate-pulse" />
        </div>

        {/* Blood red accent lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-800 to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-800 to-transparent opacity-60" />

        {/* Particle/ember effects */}
        <div className="absolute inset-0 overflow-hidden">
          {EMBER_POSITIONS.map((ember) => (
            <div
              key={ember.id}
              className="absolute w-1 h-1 bg-orange-500/60 rounded-full animate-float"
              style={{
                left: `${ember.left}%`,
                top: `${ember.top}%`,
                animationDelay: `${ember.delay}s`,
                animationDuration: `${ember.duration}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        
        {/* Opening Text 1 */}
        <div 
          className={`absolute text-center transition-all duration-[2000ms] ${
            phase >= 2 && phase < 3 
              ? 'opacity-100 translate-y-0' 
              : phase >= 3 
                ? 'opacity-0 -translate-y-10' 
                : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-gray-400 text-xl md:text-2xl font-light tracking-[0.3em] uppercase">
            In an era of chaos and bloodshed...
          </p>
        </div>

        {/* Opening Text 2 */}
        <div 
          className={`absolute text-center transition-all duration-[2000ms] ${
            phase >= 3 && phase < 4 
              ? 'opacity-100 translate-y-0' 
              : phase >= 4 
                ? 'opacity-0 -translate-y-10' 
                : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-gray-300 text-xl md:text-2xl font-light tracking-[0.3em] uppercase">
            Seven kingdoms wage endless war...
          </p>
        </div>

        {/* Opening Text 3 */}
        <div 
          className={`absolute text-center transition-all duration-[2000ms] ${
            phase >= 4 && phase < 5 
              ? 'opacity-100 translate-y-0' 
              : phase >= 5 
                ? 'opacity-0 -translate-y-10' 
                : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-gray-200 text-xl md:text-2xl font-light tracking-[0.3em] uppercase">
            Only one will unite all under heaven.
          </p>
        </div>

        {/* Main Title */}
        <div 
          className={`text-center transition-all duration-[2000ms] ${
            phase >= 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          }`}
        >
          {/* Chinese Characters */}
          <div className="mb-4">
            <span 
              className={`text-6xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-b from-red-500 via-red-700 to-red-900 bg-clip-text text-transparent drop-shadow-2xl transition-all duration-1000 ${
                phase >= 5 ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ 
                fontFamily: 'serif',
                textShadow: '0 0 40px rgba(220, 38, 38, 0.5), 0 0 80px rgba(220, 38, 38, 0.3)',
              }}
            >
              戰國棋
            </span>
          </div>

          {/* English Title */}
          <h1 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.5em] text-white uppercase transition-all duration-1000 delay-500 ${
              phase >= 5 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            }}
          >
            Zhanguo Qi
          </h1>

          {/* Subtitle */}
          <p 
            className={`mt-6 text-xl md:text-2xl text-gray-400 tracking-[0.4em] uppercase transition-all duration-1000 ${
              phase >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            The Warring States Chess
          </p>

          {/* Decorative line */}
          <div 
            className={`mt-8 mx-auto h-px bg-gradient-to-r from-transparent via-red-600 to-transparent transition-all duration-1000 ${
              phase >= 6 ? 'w-64 opacity-100' : 'w-0 opacity-0'
            }`}
          />

          {/* Enter prompt */}
          <p 
            className={`mt-12 text-gray-500 text-sm tracking-widest uppercase animate-pulse transition-all duration-1000 ${
              phase >= 6 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Click anywhere to continue
          </p>
        </div>
      </div>

      {/* Skip indicator */}
      {canSkip && phase < 5 && (
        <div className="absolute bottom-8 right-8 text-gray-600 text-sm tracking-wider animate-pulse">
          Click to skip
        </div>
      )}

      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.8) 100%)',
        }}
      />
    </div>
  );
}
