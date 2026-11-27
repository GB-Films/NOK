class NokSoundEngine {
  constructor() {
    this.context = null;
    this.compressor = null;
    this.output = null;
    this.volume = 0.7;
  }

  setVolume(value) {
    this.volume = Math.min(1, Math.max(0, Number(value) || 0));
    if (this.output && this.context) {
      this.output.gain.setTargetAtTime(
        0.18 * this.volume,
        this.context.currentTime,
        0.015,
      );
    }
  }

  async play(kind = "tap") {
    if (this.volume <= 0) return;
    if (!this.context) this.setup();
    if (!this.context || !this.output) return;
    if (this.context.state === "suspended") await this.context.resume();

    if (kind === "confirm") {
      this.tone({
        frequency: 620,
        endFrequency: 760,
        offset: 0,
        duration: 0.065,
        gain: 0.82,
        type: "square",
      });
      this.tone({
        frequency: 880,
        endFrequency: 1080,
        offset: 0.055,
        duration: 0.09,
        gain: 0.72,
        type: "triangle",
      });
      return;
    }

    if (kind === "danger") {
      this.tone({
        frequency: 260,
        endFrequency: 145,
        offset: 0,
        duration: 0.11,
        gain: 0.8,
        type: "sawtooth",
      });
      return;
    }

    if (kind === "alarm") {
      [0, 0.18, 0.36].forEach((offset) => {
        this.tone({
          frequency: 740,
          endFrequency: 980,
          offset,
          duration: 0.14,
          gain: 0.9,
          type: "square",
        });
      });
      return;
    }

    this.tone({
      frequency: 520,
      endFrequency: 380,
      offset: 0,
      duration: 0.055,
      gain: 0.62,
      type: "square",
    });
  }

  destroy() {
    if (this.context) void this.context.close();
    this.context = null;
    this.compressor = null;
    this.output = null;
  }

  setup() {
    const context = new AudioContext();
    const compressor = context.createDynamicsCompressor();
    const output = context.createGain();
    compressor.threshold.value = -20;
    compressor.knee.value = 8;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.08;
    output.gain.value = 0.18 * this.volume;
    compressor.connect(output).connect(context.destination);
    this.context = context;
    this.compressor = compressor;
    this.output = output;
  }

  tone(options) {
    const context = this.context;
    const compressor = this.compressor;
    if (!context || !compressor) return;
    const start = context.currentTime + options.offset;
    const end = start + options.duration;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = options.type;
    oscillator.frequency.setValueAtTime(options.frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(
      options.endFrequency,
      end,
    );
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(
      options.gain,
      start + 0.006,
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(envelope).connect(compressor);
    oscillator.start(start);
    oscillator.stop(end + 0.01);
  }
}

window.NokSoundEngine = NokSoundEngine;
