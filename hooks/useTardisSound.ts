
import { useEffect, useRef } from 'react';

export const useTardisSound = (enabled: boolean) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  useEffect(() => {
    if (!enabled) {
      // Cleanup if disabled
      nodesRef.current.forEach(node => {
          try { (node as any).stop && (node as any).stop(); } catch(e){}
          node.disconnect();
      });
      nodesRef.current = [];
      if (audioCtxRef.current?.state === 'running') {
        audioCtxRef.current.suspend();
      }
      return;
    }

    const initAudio = () => {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      
      const ctx = new Ctx();
      audioCtxRef.current = ctx;

      // Master Gain for volume control
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.15; // Not too loud
      masterGain.connect(ctx.destination);
      nodesRef.current.push(masterGain);

      // TARDIS Sound Synthesis
      // The sound is essentially dragging a key across a piano wire + processed noise.
      // We will simulate it with filtered noise and saw waves.

      // 1. The "Groan" (Sawtooth waves with heavy filtering)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 50; 
      
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.value = 51; // Slight detune for phasing

      // Filter for the oscillators
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 10;
      filter.frequency.value = 200;

      // LFO to sweep the filter (The "Whoosh")
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.2; // Slow cycle (5 seconds)
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 300; // Sweep range

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);

      osc1.start();
      osc2.start();
      lfo.start();

      nodesRef.current.push(osc1, osc2, filter, lfo, lfoGain);

      // 2. The "Wind/Vortex" (Pinkish Noise)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02; // Simple pinking filter
        lastOut = data[i];
        data[i] *= 3.5; 
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.Q.value = 1;
      noiseFilter.frequency.value = 400;

      // Modulate noise volume
      const noiseLfo = ctx.createOscillator();
      noiseLfo.type = 'triangle';
      noiseLfo.frequency.value = 0.4;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.1;

      noiseLfo.connect(noiseGain.gain);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      noise.start();
      noiseLfo.start();

      nodesRef.current.push(noise, noiseFilter, noiseLfo, noiseGain);
    };

    initAudio();

    return () => {
        nodesRef.current.forEach(node => {
            try { (node as any).stop && (node as any).stop(); } catch(e){}
            node.disconnect();
        });
        nodesRef.current = [];
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
        }
    };
  }, [enabled]);
};
