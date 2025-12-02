import React from 'react';

interface DisplayProps {
  gameOver?: boolean;
  text: string;
  label?: string;
}

const Display: React.FC<DisplayProps> = ({ gameOver, text, label }) => (
  <div
    className={`
      box-border flex flex-col items-center justify-center 
      mb-4 p-4 rounded-lg border-4 w-full shadow-lg
      ${
        gameOver
          ? 'border-red-500 bg-red-900/50 text-red-500'
          : 'border-[#003b6f] bg-[#001f3f] text-blue-100'
      }
      font-vt323
    `}
  >
    {label && <span className="text-sm uppercase tracking-widest text-blue-400 mb-1">{label}</span>}
    <span className={`text-2xl ${gameOver ? 'text-red-500' : 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]'}`}>{text}</span>
  </div>
);

export default Display;