import React from 'react';

// Simple SVG icon for microphone/audio
const MicrophoneIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-sky-400">
    <path d="M11.999 14.949c1.656 0 2.999-1.343 2.999-2.999v-5.9c0-1.657-1.343-3-2.999-3s-3 1.343-3 3.001v5.899c0 1.656 1.344 2.999 3 2.999Z" />
    <path d="M11.999 18.951c-3.356 0-6.042-2.581-6.196-5.839l-.004-.161h2c.145 2.201 2.029 3.947 4.2 3.947s4.055-1.746 4.2-3.947h2l-.004.161c-.154 3.258-2.84 5.839-6.196 5.839Z" />
    <path d="M10.999 18.951V22h2.001v-3.049c.001 0 .001 0 0 0h-2.001Z" />
  </svg>
);


export const AppTitle: React.FC = () => {
  return (
    <div className="hidden sm:flex items-center justify-center mb-4">
      <MicrophoneIcon />
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
        EduAudio Scribe
      </h1>
    </div>
  );
};