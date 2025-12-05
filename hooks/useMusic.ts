
import { useEffect, useRef } from 'react';

export const useMusic = (enabled: boolean) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (timerIDRef.current) {
        window.clearTimeout(timerIDRef.current);
        timerIDRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    const setupAudio = () => {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      
      // Master volume to keep it balanced with effects
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.4;
      masterGain.connect(ctx.destination);

      nextNoteTimeRef.current = ctx.currentTime + 0.1;

      // --- SYNTH INSTRUMENTS ---

      const playBass = (time: number) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.value = 82.41; // E2

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        const duration = 0.15;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        osc.start(time);
        osc.stop(time + duration + 0.1);
      };

      const playLead = (time: number, freq: number, glideTo?: number) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        if (glideTo) {
            osc.frequency.exponentialRampToValueAtTime(glideTo, time + 0.8);
        }

        // Vibrato
        const vibOsc = ctx.createOscillator();
        const vibGain = ctx.createGain();
        vibOsc.frequency.value = 6; 
        vibGain.gain.value = 10;
        vibOsc.connect(vibGain);
        vibGain.connect(osc.frequency);
        vibOsc.start(time);

        osc.connect(gain);
        gain.connect(masterGain);

        // Theremin-like envelope
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + 0.2);
        gain.gain.setValueAtTime(0.15, time + 1.0);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 1.5);

        osc.start(time);
        osc.stop(time + 1.5);
      };

      const playNoise = (time: number) => {
        if (!ctx) return;
        const bufferSize = ctx.sampleRate * 0.1; 
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        
        noise.start(time);
      };

      // --- SEQUENCER ---

      const schedule = () => {
        if (!audioCtxRef.current) return;
        const currentCtx = audioCtxRef.current;

        while (nextNoteTimeRef.current < currentCtx.currentTime + 0.1) {
           const t = nextNoteTimeRef.current;
           const beatIndex = Math.floor(t * 8); // 8th notes roughly (120bpm approx)
           
           // Bass triplets pattern
           // x x - x x - x x -
           const bassPattern = [1, 1, 0, 1, 1, 0, 1, 1];
           if (bassPattern[beatIndex % 8]) {
               playBass(t);
           }
           
           // Hi-hat noise on off-beats
           if (beatIndex % 4 === 2) {
               playNoise(t);
           }

           // Melody Loop (Simplified Theme)
           // Approx 2 seconds per measure at this tempo
           const melodyStep = Math.floor(beatIndex / 4) % 64;
           
           // Simple mapping of the melody start points
           if (beatIndex % 4 === 0) { // Only trigger on beats
             if (melodyStep === 0) playLead(t, 659.25, 587.33); // E5 glide D5
             if (melodyStep === 8) playLead(t, 587.33); // D5
             if (melodyStep === 12) playLead(t, 493.88); // B4
             if (melodyStep === 16) playLead(t, 392.00); // G4
             if (melodyStep === 20) playLead(t, 587.33); // D5
             if (melodyStep === 24) playLead(t, 493.88); // B4
             if (melodyStep === 28) playLead(t, 392.00); // G4
             if (melodyStep === 32) playLead(t, 659.25); // E5
           }

           nextNoteTimeRef.current += 0.125; 
        }
        
        timerIDRef.current = window.setTimeout(schedule, 25);
      };

      schedule();
    };

    setupAudio();

    return () => {
        if (timerIDRef.current) {
            window.clearTimeout(timerIDRef.current);
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
        }
    };
  }, [enabled]);
};
