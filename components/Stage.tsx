
import React from 'react';
import Cell from './Cell';
import { Grid, ITeleport } from '../types';

interface StageProps {
  stage: Grid;
  animatingRows: number[];
  teleport: ITeleport | null;
}

const Stage: React.FC<StageProps> = ({ stage, animatingRows, teleport }) => {
    
    // Calculate laser position and size
    const isAnimating = animatingRows.length > 0;
    const minRow = isAnimating ? Math.min(...animatingRows) : 0;
    const maxRow = isAnimating ? Math.max(...animatingRows) : 0;
    const rowCount = animatingRows.length;
    
    // 1 row = 5% height (approx), 4 rows = 20%
    const topPercentage = (minRow / 20) * 100;
    const heightPercentage = (rowCount / 20) * 100;
    
    return (
        <div className="relative p-2 md:p-4 bg-[#003b6f] rounded shadow-[0_0_50px_rgba(0,59,111,0.6)] border-r-4 border-b-4 border-[#002344]">
            {/* TARDIS Top Sign */}
            <div className="bg-[#1a1a1a] border border-[#f5f5f5] px-4 py-1 mb-3 text-center shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                <h2 className="text-white font-sans font-bold tracking-[0.1em] text-[0.6rem] md:text-xs leading-tight whitespace-nowrap">
                    POLICE <span className="mx-1 md:mx-4">PUBLIC</span> CALL <span className="mx-1 md:mx-4">BOX</span>
                </h2>
            </div>

            {/* Container for Grid and Overlay Elements */}
            <div className="relative">
                
                {/* Stage Grid (Clipped) */}
                <div className="relative grid grid-cols-10 grid-rows-20 gap-[1px] border-8 border-[#003b6f] bg-[#111] p-1 h-[60vh] w-auto aspect-[1/2] md:h-[75vh] overflow-hidden">
                    {stage.map((row, y) =>
                        row.map((cell, x) => {
                            // Apply disintegration effect if this row is animating
                            const isExploding = animatingRows.includes(y);
                            return (
                                <div key={x} className={`relative w-full h-full ${isExploding ? 'animate-disintegrate' : ''}`}>
                                    <Cell type={cell[0]} />
                                    {/* White flash overlay for disintegration */}
                                    {isExploding && (
                                        <div 
                                            className="absolute inset-0 bg-white z-10 animate-flash-white"
                                            style={{ animationDelay: `${x * 50}ms` }} 
                                        />
                                    )}
                                </div>
                            );
                        })
                    )}
                    
                    {/* Teleport Effect Overlay */}
                    {teleport && teleport.active && (
                        <div className="absolute inset-0 pointer-events-none z-20">
                            {teleport.tetromino.map((row, relativeY) => 
                                row.map((value, relativeX) => {
                                    if (value !== 0) {
                                        // Calculate grid position percentages
                                        const left = (teleport.x + relativeX) * 10;
                                        const top = (teleport.yStart + relativeY) * 5;
                                        const height = (teleport.yEnd - teleport.yStart) * 5;
                                        
                                        return (
                                            <div key={`tp-grp-${relativeY}-${relativeX}`} className="contents">
                                                 {/* The Beam */}
                                                <div 
                                                    className="absolute animate-teleport-beam"
                                                    style={{
                                                        left: `${left}%`,
                                                        top: `${top}%`,
                                                        width: '10%',
                                                        height: `${height}%`,
                                                        background: 'linear-gradient(to bottom, rgba(136, 226, 255, 0) 0%, rgba(136, 226, 255, 0.4) 30%, rgba(200, 240, 255, 0.9) 100%)',
                                                        boxShadow: '0 0 15px rgba(136, 226, 255, 0.6)',
                                                        zIndex: 20
                                                    }}
                                                />
                                                {/* The Impact Flash */}
                                                <div 
                                                    className="absolute animate-teleport-flash bg-white mix-blend-screen"
                                                     style={{
                                                        left: `${left}%`,
                                                        top: `${(teleport.yEnd + relativeY) * 5}%`,
                                                        width: '10%',
                                                        height: '5%',
                                                        zIndex: 21
                                                    }}
                                                />
                                            </div>
                                        );
                                    }
                                    return null;
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* DALEK & LASER OVERLAY (Unclipped) */}
                {/* Positioned absolutely over the grid container, but allowing overflow for the Dalek */}
                {isAnimating && (
                    <div className="absolute inset-0 pointer-events-none z-50">
                        {/* The Dalek - Positioned to the left of the board */}
                        <div 
                            className="absolute transition-all duration-300 ease-out animate-dalek-enter"
                            style={{
                                top: `${Math.max(0, topPercentage - 5)}%`, // Position relative to the row being cleared
                                left: '-140px', // Outside the board to the left
                                height: '120px',
                                width: '100px',
                            }}
                        >
                            {/* Speech Bubble */}
                            <div className="absolute -top-12 left-10 bg-white text-black p-2 rounded-xl rounded-bl-none font-bold text-xs whitespace-nowrap border-2 border-black animate-pop-in z-50">
                                EXTERMINATE!
                            </div>

                            {/* Dalek CSS Art */}
                            <div className="relative w-full h-full"> {/* Removed scale-x-[-1] so it faces right (original orientation) */}
                                {/* Dome */}
                                <div className="absolute top-0 left-2 w-16 h-10 bg-yellow-700 rounded-t-full border-2 border-yellow-900 z-20"></div>
                                {/* Eye Stalk */}
                                <div className="absolute top-4 left-10 w-16 h-2 bg-gray-400 rotate-[-10deg] origin-left z-10 animate-scan"></div>
                                <div className="absolute top-1 left-24 w-4 h-4 bg-blue-400 rounded-full border border-black shadow-[0_0_5px_blue] z-10 animate-scan"></div>
                                {/* Neck */}
                                <div className="absolute top-8 left-2 w-16 h-6 bg-black z-10 grid grid-cols-4 gap-1 p-1">
                                    <div className="bg-gray-600 rounded-sm"></div>
                                    <div className="bg-gray-600 rounded-sm"></div>
                                    <div className="bg-gray-600 rounded-sm"></div>
                                    <div className="bg-gray-600 rounded-sm"></div>
                                </div>
                                {/* Body */}
                                <div className="absolute top-14 left-0 w-20 h-24 bg-yellow-700 clip-trapezoid flex flex-col items-center justify-around py-2 border-l-2 border-r-2 border-yellow-900">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-yellow-900 rounded-full shadow-inner"></div>
                                        <div className="w-3 h-3 bg-yellow-900 rounded-full shadow-inner"></div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-4 h-4 bg-yellow-900 rounded-full shadow-inner"></div>
                                        <div className="w-4 h-4 bg-yellow-900 rounded-full shadow-inner"></div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="w-5 h-5 bg-yellow-900 rounded-full shadow-inner"></div>
                                        <div className="w-5 h-5 bg-yellow-900 rounded-full shadow-inner"></div>
                                    </div>
                                </div>
                                {/* Gun Stick */}
                                <div className="absolute top-20 left-12 w-10 h-2 bg-gray-400 z-30"></div> 
                            </div>
                        </div>

                        {/* The Laser Beam */}
                        <div 
                            className="absolute left-0 z-40 bg-blue-400/80 shadow-[0_0_15px_#00ffff] border-y-2 border-white mix-blend-screen animate-laser-fire origin-left"
                            style={{
                                top: `${topPercentage}%`,
                                height: `${heightPercentage}%`,
                                width: '100%',
                            }}
                        >
                            {/* Inner core of laser */}
                            <div className="w-full h-1/3 bg-white blur-[2px] absolute top-1/3"></div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .clip-trapezoid {
                    clip-path: polygon(20% 0, 80% 0, 100% 100%, 0% 100%);
                }
                @keyframes dalek-enter {
                    0% { transform: translateX(-50px); opacity: 0; }
                    20% { transform: translateX(0); opacity: 1; }
                    80% { transform: translateX(0); opacity: 1; }
                    100% { transform: translateX(-50px); opacity: 0; }
                }
                @keyframes pop-in {
                    0% { opacity: 0; transform: scale(0); }
                    25% { opacity: 1; transform: scale(1.1); }
                    30% { transform: scale(1); }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes laser-fire {
                    0% { transform: scaleX(0); opacity: 0; }
                    25% { transform: scaleX(0); opacity: 1; } /* Wait for Dalek to arrive */
                    30% { transform: scaleX(1); opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes disintegrate {
                    0% { opacity: 1; transform: scale(1); }
                    30% { opacity: 1; transform: scale(1); filter: brightness(1); }
                    50% { filter: brightness(10); } /* Flash */
                    100% { opacity: 0; transform: scale(0.8); }
                }
                .animate-disintegrate {
                    animation: disintegrate 1s forwards;
                    animation-delay: 300ms; /* Sync with laser */
                }
                .animate-dalek-enter {
                    animation: dalek-enter 1.5s forwards;
                    animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
                }
                .animate-pop-in {
                    animation: pop-in 1.5s forwards;
                    animation-delay: 0.1s;
                }
                .animate-laser-fire {
                    animation: laser-fire 1.5s forwards;
                }
                @keyframes scan {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-2px); }
                }
                .animate-scan {
                    animation: scan 0.5s infinite;
                }
                @keyframes flash-white {
                    0% { opacity: 0; }
                    30% { opacity: 0; }
                    40% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .animate-flash-white {
                    animation: flash-white 1s forwards;
                }
                @keyframes teleport-beam {
                    0% { opacity: 0; transform: scaleY(0.1); }
                    20% { opacity: 1; transform: scaleY(1); }
                    100% { opacity: 0; width: 0%; transform: scaleY(1); }
                }
                .animate-teleport-beam {
                    animation: teleport-beam 0.3s ease-out forwards;
                    transform-origin: bottom center;
                }
                @keyframes teleport-flash {
                    0% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 1; transform: scale(1.5); }
                    100% { opacity: 0; transform: scale(2); }
                }
                .animate-teleport-flash {
                    animation: teleport-flash 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Stage;
