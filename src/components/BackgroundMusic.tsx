/**
 * Background Music Component
 * Plays ambient war music throughout the game
 * Starts when intro begins (triggered by first click on intro)
 */

import { useState, useRef, useEffect } from 'react';

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Start music on any user interaction (first click on intro will trigger this)
  useEffect(() => {
    const startOnInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.volume = 0.5; // Start at 50% volume
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Autoplay blocked - will need manual start
        });
      }
    };

    // Listen for any user interaction
    document.addEventListener('click', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);
    document.addEventListener('touchstart', startOnInteraction);

    return () => {
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
      document.removeEventListener('touchstart', startOnInteraction);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    }
  };

  return (
    <>
      {/* Local audio file */}
      <audio
        ref={audioRef}
        src="/bg.mp3"
        loop
        preload="auto"
      />

      {/* Music control button */}
      <div 
        className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${
          isMinimized ? 'opacity-50 hover:opacity-100' : ''
        }`}
      >
        <div className="flex items-center gap-2 bg-stone-900/90 backdrop-blur-sm rounded-full px-3 py-2 border border-amber-900/50 shadow-lg">
          {!isMinimized && (
            <span className="text-amber-200/60 text-xs">🎵 BGM</span>
          )}
          <button
            onClick={togglePlay}
            className={`transition-colors text-lg ${
              isPlaying ? 'text-amber-400 hover:text-amber-300' : 'text-stone-400 hover:text-white'
            }`}
            title={isPlaying ? 'Stop Music' : 'Play Music'}
          >
            {isPlaying ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-stone-400 hover:text-white transition-colors text-xs"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '◀' : '▶'}
          </button>
        </div>
      </div>
    </>
  );
}
