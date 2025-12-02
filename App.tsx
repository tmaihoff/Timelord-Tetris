
import React, { useState, useRef, useEffect } from 'react';
import { createStage, checkCollision } from './utils';
import { useInterval } from './hooks/useInterval';
import { usePlayer } from './hooks/usePlayer';
import { useStage } from './hooks/useStage';
import { useGameStatus } from './hooks/useGameStatus';
import { ITeleport } from './types';

import Stage from './components/Stage';
import Display from './components/Display';
import Controls from './components/Controls';
import { Play, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [teleport, setTeleport] = useState<ITeleport | null>(null);

  const { player, updatePlayerPos, resetPlayer, playerRotate, setPlayer } = usePlayer();
  const { stage, setStage, rowsCleared, animatingRows } = useStage(player, resetPlayer);
  const { score, setScore, rows, setRows, level, setLevel } = useGameStatus(rowsCleared);

  // Focus reference for keyboard events
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Audio Ref
  const exterminateAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
      // Pre-load the authentic Dalek sound
      exterminateAudio.current = new Audio('https://ia800201.us.archive.org/18/items/Dalek_Exterminate/Exterminate.mp3');
      exterminateAudio.current.volume = 1.0;
  }, []);

  // Play Exterminate Sound
  const playExterminateSound = () => {
    // 1. Play the authentic MP3 Voice
    if (exterminateAudio.current) {
        exterminateAudio.current.currentTime = 0;
        exterminateAudio.current.play().catch(e => console.warn("Audio playback blocked:", e));
    }

    // 2. Web Audio Synth for Laser/Gun effect (Layered on top)
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const t = ctx.currentTime;

        // Oscillator for the "Zap"
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Metallic sawtooth wave
        osc.type = 'sawtooth';
        
        // Frequency sweep (high to low)
        osc.frequency.setValueAtTime(2000, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.4);
        
        // Volume envelope
        gain.gain.setValueAtTime(0.3, t); // Slightly lower volume to let voice punch through
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(t);
        osc.stop(t + 0.5);

        // Add a second layer for "Ring Mod" feel (Noise burst)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(50, t); // Low rumble
        gain2.gain.setValueAtTime(0.2, t);
        gain2.gain.linearRampToValueAtTime(0, t + 0.3);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t);
        osc2.stop(t + 0.3);

    } catch (e) {
        console.error("Audio synth failed", e);
    }
  };

  // Effect to play Exterminate sound
  useEffect(() => {
    if (animatingRows.length > 0) {
        playExterminateSound();
    }
  }, [animatingRows]);

  const movePlayer = (dir: number) => {
    // Disable movement during animation
    if (animatingRows.length > 0) return;

    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const startGame = () => {
    // Reset everything
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setRows(0);
    setLevel(0);
    setGameStarted(true);
    setTeleport(null);
    
    // Unlock audio context on user interaction
    if (exterminateAudio.current) {
        exterminateAudio.current.play().then(() => {
            exterminateAudio.current?.pause();
            exterminateAudio.current!.currentTime = 0;
        }).catch(() => {});
    }
    
    gameAreaRef.current?.focus();
  };

  const drop = () => {
    // Pause drop if animating
    if (animatingRows.length > 0) return;

    // Increase level means faster drop time
    if (rows > (level + 1) * 10) {
      setLevel((prev) => prev + 1);
      // Increase speed
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Game Over
      if (player.pos.y < 1) {
        console.log('GAME OVER!!!');
        setGameOver(true);
        setDropTime(null);
        setGameStarted(false);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const keyUp = ({ keyCode }: { keyCode: number }) => {
    if (!gameOver && animatingRows.length === 0) {
      if (keyCode === 40 || keyCode === 83) { // Down Arrow or S
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  };

  const dropPlayer = () => {
    if (animatingRows.length > 0) return;
    setDropTime(null);
    drop();
  };

  const hardDrop = () => {
    if (animatingRows.length > 0 || gameOver || !gameStarted) return;
    
    let tempY = 0;
    while (!checkCollision(player, stage, { x: 0, y: tempY + 1 })) {
        tempY += 1;
    }

    // Trigger Teleport Animation
    setTeleport({
        active: true,
        x: player.pos.x,
        yStart: player.pos.y,
        yEnd: player.pos.y + tempY,
        tetromino: player.tetromino
    });
    
    // Play teleport sound (short swoosh)
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } catch(e) {}

    // Clear animation after short delay (match CSS animation duration)
    setTimeout(() => setTeleport(null), 300);

    updatePlayerPos({ x: 0, y: tempY, collided: true });
  }

  const move = (e: React.KeyboardEvent) => {
    if (!gameOver && gameStarted && animatingRows.length === 0) {
      const { key } = e;
      
      // WASD + Arrows Support
      if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        movePlayer(-1);
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        movePlayer(1);
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        dropPlayer();
      } else if (key === 'ArrowUp') {
        // Keep arrow up for rotation just in case
        playerRotate(stage, 1);
      } else if (key === ' ' || key === 'w' || key === 'W') { 
        // Space or W for Hard Drop
        hardDrop();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!gameOver && gameStarted && animatingRows.length === 0) {
        // 0 = Left Click, 2 = Right Click
        if (e.button === 0) {
            playerRotate(stage, -1); // Rotate Left (CCW)
        } else if (e.button === 2) {
            playerRotate(stage, 1); // Rotate Right (CW)
        }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent right-click menu
  };

  useInterval(() => {
    drop();
  }, dropTime);

  // Focus handling
  useEffect(() => {
      if(gameStarted && !gameOver) {
          gameAreaRef.current?.focus();
      }
  }, [gameStarted, gameOver]);

  return (
    <div
      className="w-full h-screen bg-[#0b1016] overflow-hidden flex flex-col items-center justify-center outline-none no-select cursor-crosshair"
      role="button"
      tabIndex={0}
      onKeyDown={move}
      onKeyUp={keyUp}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      ref={gameAreaRef}
    >
        {/* Time Vortex Background Effect */}
        <div className="absolute inset-0 bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-blue-900 via-[#003b6f] to-black -z-10 animate-pulse opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] -z-10"></div>
        
      {/* Header */}
      <h1 className="text-4xl md:text-6xl font-vt323 text-blue-100 mb-4 md:mb-8 tracking-wider drop-shadow-[0_0_15px_rgba(0,100,255,0.8)]">
        TIME LORD TETRIS
      </h1>

      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-12 max-w-[95vw] mx-auto p-4 w-full justify-center">
        
        {/* Game Stage */}
        <div className="relative group">
            <Stage stage={stage} animatingRows={animatingRows} teleport={teleport} />
            
            {/* Start Overlay */}
            {!gameStarted && !gameOver && (
                 <div className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col z-10 backdrop-blur-sm rounded-sm border-4 border-[#003b6f]">
                     <p className="font-vt323 text-blue-200 text-3xl mb-4 text-center px-4 tracking-widest">INITIATE<br/>SEQUENCE</p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); startGame(); }}
                        className="flex items-center gap-2 bg-[#003b6f] hover:bg-[#004b8f] text-white font-bold py-3 px-6 rounded border border-blue-400 shadow-[0_0_15px_rgba(0,100,255,0.5)] active:translate-y-[2px] transition-all font-vt323 text-xl"
                    >
                        <Play size={20} /> ENGAGE
                    </button>
                 </div>
            )}

            {/* Game Over Overlay */}
            {gameOver && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center flex-col z-10 backdrop-blur-sm rounded-sm border-4 border-red-900">
                    <h2 className="text-5xl text-red-500 font-vt323 mb-2 animate-pulse">PARADOX</h2>
                    <p className="text-xl text-gray-400 font-vt323 mb-6">LINES: {rows}</p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); startGame(); }}
                        className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 font-bold py-3 px-6 rounded shadow-[0_4px_0_rgb(156,163,175)] active:shadow-none active:translate-y-[4px] transition-all font-vt323 text-xl"
                    >
                        <RotateCcw size={20} /> REGENERATE
                    </button>
                </div>
            )}
        </div>

        {/* Sidebar Info */}
        <div className="w-full md:w-56 flex flex-row md:flex-col justify-between md:justify-start gap-4 pointer-events-none">
          <div className="w-full space-y-4 hidden md:block">
            <Display label="Score" text={score.toString()} />
            <Display label="Rows" text={rows.toString()} />
            <Display label="Level" text={level.toString()} />
          </div>

           {/* Mobile Stats (Compact) */}
           <div className="w-full flex justify-between gap-2 md:hidden">
              <div className="bg-[#003b6f]/80 p-2 rounded border border-blue-900 w-1/3 text-center">
                  <p className="text-xs text-blue-200 uppercase">Score</p>
                  <p className="text-lg font-vt323 text-white">{score}</p>
              </div>
              <div className="bg-[#003b6f]/80 p-2 rounded border border-blue-900 w-1/3 text-center">
                  <p className="text-xs text-blue-200 uppercase">Level</p>
                  <p className="text-lg font-vt323 text-white">{level}</p>
              </div>
           </div>

          {/* Desktop Controls Info */}
          <div className="hidden md:block bg-[#001f3f]/80 p-4 rounded border border-[#003b6f] text-blue-200 font-vt323 text-lg mt-4 shadow-lg">
              <p className="mb-2 text-white border-b border-blue-800 pb-1 tracking-widest">FLIGHT MANUAL</p>
              <div className="flex justify-between mb-1 text-blue-300"><span>Left/Right</span> <span className="text-white">A / D</span></div>
              <div className="flex justify-between mb-1 text-blue-300"><span>Soft Drop</span> <span className="text-white">S</span></div>
              <div className="flex justify-between mb-1 text-blue-300"><span>Hard Drop</span> <span className="text-white">W</span></div>
              <div className="flex justify-between mb-1 text-blue-300"><span>Rotate Left</span> <span className="text-white">L-Click</span></div>
              <div className="flex justify-between text-blue-300"><span>Rotate Right</span> <span className="text-white">R-Click</span></div>
          </div>
        </div>

      </div>

      {/* Mobile Controls (Preserved but styled blue) */}
      <div className="md:hidden">
         <Controls 
            move={(dir) => movePlayer(dir)} 
            rotate={() => playerRotate(stage, 1)} 
            drop={dropPlayer}
            hardDrop={hardDrop}
        />
      </div>
      
    </div>
  );
};

export default App;
