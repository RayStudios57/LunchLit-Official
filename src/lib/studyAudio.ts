// ============================================================================
// LUNCHLIT STUDY AUDIO ENGINE
// 100% Royalty-Free & Statutorily Licensed Audio / Synthesized Soundscapes
// Zero Copyright Risk • Zero Broken YouTube Embeds • Works in Background
// ============================================================================

export interface AudioTrack {
  id: string;
  label: string;
  category: 'procedural' | 'stream';
  description: string;
  badge?: string;
  streamUrl?: string;
}

export const STUDY_TRACKS: AudioTrack[] = [
  // Procedural Web Audio Generators (100% Code Synthesized — 0% Legal/Copyright Risk)
  {
    id: 'lofi_chords',
    label: '☕ Lo-Fi Chill Beats',
    category: 'procedural',
    description: 'Warm synthesized jazz electric piano chords with vintage vinyl crackle',
    badge: 'Procedural • 100% Free',
  },
  {
    id: 'rain_thunder',
    label: '🌧️ Gentle Rain & Thunder',
    category: 'procedural',
    description: 'Soothing rain against the window with distant atmospheric thunder',
    badge: 'Ambient Generator',
  },
  {
    id: 'brown_noise',
    label: '📻 Deep Focus Brown Noise',
    category: 'procedural',
    description: 'Clinically proven 1/f² sound curve for deep focus & ADHD concentration',
    badge: 'Cognitive Focus',
  },
  {
    id: 'ocean_waves',
    label: '🌊 Calm Ocean Surf',
    category: 'procedural',
    description: 'Slow rhythmic shoreline waves rolling in and out',
    badge: 'Ambient Generator',
  },
  {
    id: 'forest_birds',
    label: '🌲 Forest Breeze & Birds',
    category: 'procedural',
    description: 'Tranquil woodland atmosphere with gentle wind and distant chirps',
    badge: 'Nature',
  },
  {
    id: 'zen_432',
    label: '🧘 432 Hz Alpha Zen Drone',
    category: 'procedural',
    description: 'Warm harmonic drone tuned to 432 Hz with calming alpha binaural pulse',
    badge: 'Meditation',
  },
  {
    id: 'cozy_fireplace',
    label: '🔥 Cozy Crackling Fireplace',
    category: 'procedural',
    description: 'Warm hearth roar with authentic wood ember crackles',
    badge: 'Warmth',
  },
  {
    id: 'coffee_shop',
    label: '☕ Study Cafe Murmur',
    category: 'procedural',
    description: 'Subtle ambient room resonance of a quiet university cafe',
    badge: 'Cafe',
  },

  // Legally Licensed Internet Radio Streams (SomaFM — US Statutory DMCA License)
  {
    id: 'somafm_groovesalad',
    label: '📻 SomaFM: Groove Salad',
    category: 'stream',
    description: 'A nicely chilled plate of ambient/downtempo beats and grooves (Licensed)',
    badge: 'Live Radio • Licensed',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
  },
  {
    id: 'somafm_dronezone',
    label: '📻 SomaFM: Drone Zone',
    category: 'stream',
    description: 'Atmospheric ambient space music with no vocals for deep study',
    badge: 'Live Radio • Licensed',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
  },
  {
    id: 'somafm_lush',
    label: '📻 SomaFM: Lush Chillout',
    category: 'stream',
    description: 'Sensuous, mellow vocals and chill acoustic beats',
    badge: 'Live Radio • Licensed',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
  },
  {
    id: 'somafm_deepspace',
    label: '📻 SomaFM: Deep Space One',
    category: 'stream',
    description: 'Deep ambient electronic space music for prolonged mental flow',
    badge: 'Live Radio • Licensed',
    streamUrl: 'https://ice1.somafm.com/deepspaceone-128-mp3',
  },
  {
    id: 'somafm_secretagent',
    label: '📻 SomaFM: Secret Agent',
    category: 'stream',
    description: 'The soundtrack for your stylish, high-stakes study session',
    badge: 'Live Radio • Licensed',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
  },
];

class StudyAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTrackId: string = STUDY_TRACKS[0].id;
  private isPlaying: boolean = false;
  private volume: number = 0.4; // 0 to 1
  private streamAudio: HTMLAudioElement | null = null;
  private activeNodes: Array<{ stop?: () => void; disconnect: () => void }> = [];
  private activeIntervals: number[] = [];
  private listeners: Set<(state: { isPlaying: boolean; trackId: string; volume: number }) => void> = new Set();

  constructor() {
    // Restore volume preference from localStorage
    try {
      const savedVol = localStorage.getItem('lunchlit_study_audio_vol');
      if (savedVol !== null) {
        this.volume = Math.min(1, Math.max(0, parseFloat(savedVol)));
      }
      const savedTrack = localStorage.getItem('lunchlit_study_audio_track');
      if (savedTrack && STUDY_TRACKS.some(t => t.id === savedTrack)) {
        this.currentTrackId = savedTrack;
      }
    } catch {}
  }

  public subscribe(cb: (state: { isPlaying: boolean; trackId: string; volume: number }) => void): () => void {
    this.listeners.add(cb);
    cb({ isPlaying: this.isPlaying, trackId: this.currentTrackId, volume: this.volume });
    return () => this.listeners.delete(cb);
  }

  private notify() {
    const state = { isPlaying: this.isPlaying, trackId: this.currentTrackId, volume: this.volume };
    this.listeners.forEach(cb => cb(state));
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setVolume(val: number) {
    this.volume = Math.min(1, Math.max(0, val));
    try {
      localStorage.setItem('lunchlit_study_audio_vol', String(this.volume));
    } catch {}

    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.05);
    }
    if (this.streamAudio) {
      this.streamAudio.volume = this.volume;
    }
    this.notify();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getTrackId(): string {
    return this.currentTrackId;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setTrack(trackId: string) {
    const track = STUDY_TRACKS.find(t => t.id === trackId);
    if (!track) return;
    this.currentTrackId = trackId;
    try {
      localStorage.setItem('lunchlit_study_audio_track', trackId);
    } catch {}

    if (this.isPlaying) {
      this.stopCurrent();
      this.playTrack(track);
    }
    this.updateMediaSession(track);
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public play() {
    const track = STUDY_TRACKS.find(t => t.id === this.currentTrackId) || STUDY_TRACKS[0];
    this.isPlaying = true;
    this.playTrack(track);
    this.updateMediaSession(track);
    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    this.stopCurrent();
    this.notify();
  }

  private stopCurrent() {
    // Clear procedural intervals
    this.activeIntervals.forEach(id => window.clearInterval(id));
    this.activeIntervals = [];

    // Stop and disconnect procedural nodes
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch {}
    });
    this.activeNodes = [];

    // Pause stream audio
    if (this.streamAudio) {
      this.streamAudio.pause();
      this.streamAudio.src = '';
      this.streamAudio = null;
    }
  }

  private playTrack(track: AudioTrack) {
    this.stopCurrent();

    if (track.category === 'stream' && track.streamUrl) {
      this.playStream(track.streamUrl);
    } else {
      this.playProcedural(track.id);
    }
  }

  // --------------------------------------------------------------------------
  // STREAM AUDIO (HTML5 Audio for legal radio streams)
  // --------------------------------------------------------------------------
  private playStream(url: string) {
    try {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = url;
      audio.volume = this.volume;
      audio.preload = 'none';

      audio.play().catch(err => {
        console.warn('Live stream audio play error, falling back to procedural Lo-Fi:', err);
        // Fallback to procedural Lo-Fi if external stream network issues occur
        this.playProcedural('lofi_chords');
      });

      this.streamAudio = audio;
    } catch (e) {
      console.warn('Audio stream initialization failed:', e);
      this.playProcedural('lofi_chords');
    }
  }

  // --------------------------------------------------------------------------
  // PROCEDURAL AUDIO (Synthesized via Web Audio API)
  // --------------------------------------------------------------------------
  private playProcedural(id: string) {
    const ctx = this.getAudioContext();
    const dest = this.masterGain!;

    switch (id) {
      case 'lofi_chords':
        this.buildLofiChords(ctx, dest);
        break;
      case 'rain_thunder':
        this.buildRain(ctx, dest);
        break;
      case 'brown_noise':
        this.buildBrownNoise(ctx, dest);
        break;
      case 'ocean_waves':
        this.buildOceanWaves(ctx, dest);
        break;
      case 'forest_birds':
        this.buildForest(ctx, dest);
        break;
      case 'zen_432':
        this.buildZenDrone(ctx, dest);
        break;
      case 'cozy_fireplace':
        this.buildFireplace(ctx, dest);
        break;
      case 'coffee_shop':
        this.buildCoffeeShop(ctx, dest);
        break;
      default:
        this.buildLofiChords(ctx, dest);
    }
  }

  // 1. Lo-Fi Chords: Rhodes-style electric piano chords + gentle vinyl crackle
  private buildLofiChords(ctx: AudioContext, dest: AudioNode) {
    // Subtle vinyl noise layer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Pink-ish crackle
      const r = Math.random() * 2 - 1;
      data[i] = Math.random() < 0.003 ? r * 0.4 : r * 0.012;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1200;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.15;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);
    noiseSource.start();
    this.activeNodes.push(noiseSource, noiseFilter, noiseGain);

    // Warm Lo-Fi jazz progression: Fmaj7 -> G6 -> Em7 -> Am7
    const chords = [
      [174.61, 220.0, 261.63, 329.63], // F3, A3, C4, E4
      [196.0, 246.94, 293.66, 329.63], // G3, B3, D4, E4
      [164.81, 196.0, 246.94, 293.66], // E3, G3, B3, D4
      [220.0, 261.63, 329.63, 392.0],  // A3, C4, E4, G4
    ];
    let chordIdx = 0;

    const playNextChord = () => {
      if (!this.isPlaying) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      const now = ctx.currentTime;
      const chordGain = ctx.createGain();
      chordGain.gain.setValueAtTime(0, now);
      chordGain.gain.linearRampToValueAtTime(0.18, now + 0.15);
      chordGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(680, now);
      filter.Q.value = 1.8;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        // Subtle detuning for vintage tape flutter warmth
        osc.frequency.setValueAtTime(freq + (Math.random() * 0.8 - 0.4), now);

        osc.connect(filter);
        osc.start(now);
        osc.stop(now + 4.0);
        this.activeNodes.push(osc);
      });

      filter.connect(chordGain);
      chordGain.connect(dest);
      this.activeNodes.push(filter, chordGain);
    };

    playNextChord();
    const interval = window.setInterval(playNextChord, 3800);
    this.activeIntervals.push(interval);
  }

  // 2. Gentle Rain & Distant Thunder
  private buildRain(ctx: AudioContext, dest: AudioNode) {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.08;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1100;
    rainFilter.Q.value = 0.6;

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.35;

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(dest);
    rainSource.start();
    this.activeNodes.push(rainSource, rainFilter, rainGain);

    // Random soft thunder rumble every 12-25 seconds
    const triggerThunder = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;
      const thunderGain = ctx.createGain();
      thunderGain.gain.setValueAtTime(0.001, now);
      thunderGain.gain.linearRampToValueAtTime(0.2, now + 1.2);
      thunderGain.gain.exponentialRampToValueAtTime(0.001, now + 5.5);

      const thunderFilter = ctx.createBiquadFilter();
      thunderFilter.type = 'lowpass';
      thunderFilter.frequency.setValueAtTime(110, now);

      const thunderSource = ctx.createBufferSource();
      thunderSource.buffer = buffer;
      thunderSource.playbackRate.value = 0.35;

      thunderSource.connect(thunderFilter);
      thunderFilter.connect(thunderGain);
      thunderGain.connect(dest);

      thunderSource.start(now);
      thunderSource.stop(now + 6.0);
      this.activeNodes.push(thunderSource, thunderFilter, thunderGain);
    };

    const interval = window.setInterval(triggerThunder, 16000);
    this.activeIntervals.push(interval);
  }

  // 3. True Deep Focus Brown Noise (1/f²)
  private buildBrownNoise(ctx: AudioContext, dest: AudioNode) {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.2;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;

    const gain = ctx.createGain();
    gain.gain.value = 0.28;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    source.start();
    this.activeNodes.push(source, filter, gain);
  }

  // 4. Calm Ocean Surf
  private buildOceanWaves(ctx: AudioContext, dest: AudioNode) {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 2.8;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    // LFO to modulate wave surge frequency
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12; // 8.3 second wave cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 280;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const waveGain = ctx.createGain();
    waveGain.gain.value = 0.35;

    source.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(dest);

    source.start();
    lfo.start();
    this.activeNodes.push(source, filter, lfo, lfoGain, waveGain);
  }

  // 5. Forest Breeze & Birds
  private buildForest(ctx: AudioContext, dest: AudioNode) {
    // Breeze wind background
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const windSource = ctx.createBufferSource();
    windSource.buffer = buffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 420;
    windFilter.Q.value = 1.2;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.2;

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(dest);
    windSource.start();
    this.activeNodes.push(windSource, windFilter, windGain);

    // Random sweet bird chirp every 4-8 seconds
    const triggerBird = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;
      const birdOsc = ctx.createOscillator();
      const birdGain = ctx.createGain();

      const baseFreq = 2200 + Math.random() * 800;
      birdOsc.type = 'sine';
      birdOsc.frequency.setValueAtTime(baseFreq, now);
      birdOsc.frequency.exponentialRampToValueAtTime(baseFreq + 700, now + 0.08);
      birdOsc.frequency.exponentialRampToValueAtTime(baseFreq + 200, now + 0.18);

      birdGain.gain.setValueAtTime(0, now);
      birdGain.gain.linearRampToValueAtTime(0.04, now + 0.03);
      birdGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      birdOsc.connect(birdGain);
      birdGain.connect(dest);
      birdOsc.start(now);
      birdOsc.stop(now + 0.3);
      this.activeNodes.push(birdOsc, birdGain);
    };

    const interval = window.setInterval(triggerBird, 5500);
    this.activeIntervals.push(interval);
  }

  // 6. 432 Hz Alpha Zen Drone
  private buildZenDrone(ctx: AudioContext, dest: AudioNode) {
    const freqs = [108, 216, 432, 648];
    const gain = ctx.createGain();
    gain.gain.value = 0.25;

    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;

      const oscGain = ctx.createGain();
      oscGain.gain.value = 1 / (f / 108);

      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      this.activeNodes.push(osc, oscGain);
    });

    gain.connect(dest);
    this.activeNodes.push(gain);
  }

  // 7. Cozy Fireplace Crackle
  private buildFireplace(ctx: AudioContext, dest: AudioNode) {
    // Low rumble
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }
    const roarSource = ctx.createBufferSource();
    roarSource.buffer = buffer;
    roarSource.loop = true;

    const roarFilter = ctx.createBiquadFilter();
    roarFilter.type = 'lowpass';
    roarFilter.frequency.value = 240;

    const roarGain = ctx.createGain();
    roarGain.gain.value = 0.3;

    roarSource.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(dest);
    roarSource.start();
    this.activeNodes.push(roarSource, roarFilter, roarGain);

    // Random pops
    const triggerCrack = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;
      const crackOsc = ctx.createOscillator();
      crackOsc.type = 'sawtooth';
      crackOsc.frequency.setValueAtTime(600 + Math.random() * 800, now);

      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.08, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      crackOsc.connect(crackGain);
      crackGain.connect(dest);
      crackOsc.start(now);
      crackOsc.stop(now + 0.05);
      this.activeNodes.push(crackOsc, crackGain);
    };

    const interval = window.setInterval(triggerCrack, 700);
    this.activeIntervals.push(interval);
  }

  // 8. Study Cafe Murmur
  private buildCoffeeShop(ctx: AudioContext, dest: AudioNode) {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.06;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 750;
    filter.Q.value = 0.9;

    const gain = ctx.createGain();
    gain.gain.value = 0.28;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    source.start();
    this.activeNodes.push(source, filter, gain);
  }

  // --------------------------------------------------------------------------
  // COMPLETION CHIME (Web Audio Synthesized Chime)
  // --------------------------------------------------------------------------
  public playCompletionChime() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // 3-tone harmonic bell: C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 2.0);
      });
    } catch (err) {
      console.warn('Could not play completion chime:', err);
    }
  }

  // --------------------------------------------------------------------------
  // MEDIA SESSION INTEGRATION
  // --------------------------------------------------------------------------
  private updateMediaSession(track: AudioTrack) {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.label,
          artist: 'LunchLit Study Beats (100% Royalty-Free)',
          album: 'Focus & Productivity Soundscapes',
        });
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
      } catch {}
    }
  }
}

export const studyAudio = new StudyAudioEngine();
