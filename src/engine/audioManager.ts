/**
 * Procedural Web Audio Engine for PD Acqua World.
 * Generates natural aquatic ambience, filter hum, bubble sizzle, food splashes, and nibble clicks.
 * Complies with browser autoplay policies: starts only upon user gesture.
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private filterGain: GainNode | null = null;
  private aeratorGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private isInitialized: boolean = false;

  public init(): void {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupAmbience();
      this.isInitialized = true;
    } catch {
      console.warn('Web Audio API not supported on this device.');
    }
  }

  private setupAmbience(): void {
    if (!this.ctx || !this.masterGain) return;

    // 1. Filter Hum (low-frequency gentle drone)
    const filterOsc = this.ctx.createOscillator();
    const filterHumFilter = this.ctx.createBiquadFilter();
    this.filterGain = this.ctx.createGain();

    filterOsc.type = 'triangle';
    filterOsc.frequency.setValueAtTime(58, this.ctx.currentTime); // 58 Hz hum
    filterHumFilter.type = 'lowpass';
    filterHumFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

    this.filterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    filterOsc.connect(filterHumFilter);
    filterHumFilter.connect(this.filterGain);
    this.filterGain.connect(this.masterGain);
    filterOsc.start();

    // 2. Continuous Water Ambience & Bubble Fizz (Pink/Brown noise passed through bandpass filter)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    const waterBandpass = this.ctx.createBiquadFilter();
    waterBandpass.type = 'bandpass';
    waterBandpass.frequency.setValueAtTime(650, this.ctx.currentTime);
    waterBandpass.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.aeratorGain = this.ctx.createGain();
    this.aeratorGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    this.noiseNode.connect(waterBandpass);
    waterBandpass.connect(this.aeratorGain);
    this.aeratorGain.connect(this.masterGain);
    this.noiseNode.start();
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (!this.isInitialized && !muted) {
      this.init();
    }
    if (this.ctx && this.masterGain) {
      if (this.ctx.state === 'suspended' && !muted) {
        this.ctx.resume();
      }
      const targetGain = muted ? 0 : 0.4;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public updateEquipmentAudio(filterOn: boolean, flow: number, aeratorOn: boolean, aeration: number): void {
    if (!this.ctx) return;
    if (this.filterGain) {
      const fGain = filterOn ? 0.04 + flow * 0.08 : 0;
      this.filterGain.gain.setTargetAtTime(fGain, this.ctx.currentTime, 0.1);
    }
    if (this.aeratorGain) {
      const aGain = aeratorOn ? 0.05 + aeration * 0.15 : 0;
      this.aeratorGain.gain.setTargetAtTime(aGain, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Sound effect: Food particle drops on water surface with droplet ripple pop
   */
  public playFoodDrop(): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Pitch drop from 800Hz down to 240Hz (water plink)
      osc.frequency.setValueAtTime(750 + Math.random() * 150, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio playback safety
    }
  }

  /**
   * Sound effect: Fish nibbles / takes a bite of food
   */
  public playBite(): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio safety
    }
  }

  /**
   * Sound effect: Air bubble pop at surface
   */
  public playBubblePop(): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio safety
    }
  }
}

export const audioManager = new AudioManager();
