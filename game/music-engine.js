const NOK_MUSIC_TEMPO = 66;
const NOK_MUSIC_STEP_DURATION = 60 / NOK_MUSIC_TEMPO / 2;
const NOK_MUSIC_LOOK_AHEAD = 0.35;

const NOK_MUSIC_CHORDS = [
  [52, 59, 62, 66],
  [48, 55, 59, 62, 66],
  [55, 59, 62, 64, 69],
  [50, 57, 62, 64, 69],
  [47, 54, 59, 62, 66],
  [48, 55, 59, 64],
  [45, 52, 59, 60, 64],
  [50, 57, 62, 64, 69],
];

const NOK_MUSIC_BASS_ROOTS = [40, 36, 43, 38, 35, 36, 33, 38];

const NOK_MUSIC_MELODY = [
  64, null, 67, 69, 71, null, 69, 67,
  66, null, 64, null, 62, 64, 66, null,
  67, null, 71, 69, 67, null, 64, null,
  62, null, 64, 67, 66, null, 62, null,
  64, null, 67, 71, 74, null, 71, 69,
  67, null, 66, 64, 62, null, 64, null,
  67, 69, 71, null, 69, 67, 64, null,
  62, 64, 66, null, 64, null, null, null,
];

function nokMusicMidiFrequency(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

class NokMusicEngine {
  constructor(onStateChange) {
    this.context = null;
    this.musicBus = null;
    this.output = null;
    this.reverb = null;
    this.delay = null;
    this.schedulerId = null;
    this.nextStepTime = 0;
    this.step = 0;
    this.playing = false;
    this.volume = 0.7;
    this.noiseBuffer = null;
    this.onStateChange = onStateChange;
  }

  setVolume(value) {
    this.volume = Math.min(1, Math.max(0, Number(value) || 0));
    if (this.output && this.context) {
      this.output.gain.setTargetAtTime(
        0.4 * this.volume,
        this.context.currentTime,
        0.03,
      );
    }
  }

  async toggle() {
    if (this.playing) {
      await this.pause();
      return false;
    }
    await this.play();
    return true;
  }

  async play() {
    if (!this.context) this.setup();
    if (!this.context) throw new Error("El audio no está disponible.");
    await this.context.resume();
    this.playing = true;
    this.nextStepTime = Math.max(
      this.nextStepTime,
      this.context.currentTime + 0.06,
    );
    this.schedule();
    this.schedulerId = window.setInterval(() => this.schedule(), 80);
    this.onStateChange(true);
  }

  async pause() {
    if (!this.context) return;
    if (this.schedulerId !== null) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
    await this.context.suspend();
    this.playing = false;
    this.onStateChange(false);
  }

  destroy() {
    if (this.schedulerId !== null) window.clearInterval(this.schedulerId);
    this.schedulerId = null;
    this.playing = false;
    if (this.context) void this.context.close();
    this.context = null;
  }

  setup() {
    const context = new AudioContext();
    const musicBus = context.createGain();
    const compressor = context.createDynamicsCompressor();
    const output = context.createGain();
    const reverb = context.createConvolver();
    const reverbGain = context.createGain();
    const delay = context.createDelay(1);
    const delayFeedback = context.createGain();
    const delayGain = context.createGain();

    output.gain.value = 0.4 * this.volume;
    compressor.threshold.value = -24;
    compressor.knee.value = 18;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.08;
    compressor.release.value = 0.6;
    reverb.buffer = this.createImpulse(context, 3.2, 2.8);
    reverbGain.gain.value = 0.3;
    delay.delayTime.value = 0.36;
    delayFeedback.gain.value = 0.18;
    delayGain.gain.value = 0.13;

    musicBus.connect(compressor);
    reverb.connect(reverbGain).connect(compressor);
    delay.connect(delayGain).connect(compressor);
    delay.connect(delayFeedback).connect(delay);
    compressor.connect(output).connect(context.destination);

    this.context = context;
    this.musicBus = musicBus;
    this.output = output;
    this.reverb = reverb;
    this.delay = delay;
    this.noiseBuffer = this.createNoiseBuffer(context);
    this.nextStepTime = context.currentTime + 0.06;
  }

  createImpulse(context, duration, decay) {
    const length = Math.floor(context.sampleRate * duration);
    const impulse = context.createBuffer(2, length, context.sampleRate);
    let seed = 734921;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let index = 0; index < length; index += 1) {
        const envelope = (1 - index / length) ** decay;
        data[index] = (random() * 2 - 1) * envelope;
      }
    }
    return impulse;
  }

  createNoiseBuffer(context) {
    const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 91337;
    for (let index = 0; index < data.length; index += 1) {
      seed = (seed * 48271) % 2147483647;
      data[index] = (seed / 2147483647) * 2 - 1;
    }
    return buffer;
  }

  schedule() {
    const context = this.context;
    if (!context || !this.playing) return;
    while (this.nextStepTime < context.currentTime + NOK_MUSIC_LOOK_AHEAD) {
      this.scheduleStep(this.step, this.nextStepTime);
      this.step += 1;
      this.nextStepTime += NOK_MUSIC_STEP_DURATION;
    }
  }

  scheduleStep(globalStep, time) {
    const localStep = globalStep % NOK_MUSIC_MELODY.length;
    const phrase = Math.floor(globalStep / NOK_MUSIC_MELODY.length) % 4;
    const chordIndex = Math.floor(globalStep / 8) % NOK_MUSIC_CHORDS.length;

    if (globalStep % 8 === 0) {
      this.schedulePad(
        NOK_MUSIC_CHORDS[chordIndex],
        time,
        NOK_MUSIC_STEP_DURATION * 7.8,
      );
      this.scheduleBass(
        NOK_MUSIC_BASS_ROOTS[chordIndex],
        time,
        NOK_MUSIC_STEP_DURATION * 7.2,
      );
    }

    const baseNote = NOK_MUSIC_MELODY[localStep];
    const phraseRest = phrase === 2 && localStep % 8 >= 5;
    if (baseNote !== null && !phraseRest) {
      const variation =
        phrase === 1 && [10, 26, 42, 58].includes(localStep)
          ? 2
          : phrase === 3 && localStep >= 48
            ? -2
            : 0;
      const note = baseNote + variation;
      const length =
        NOK_MUSIC_MELODY[(localStep + 1) % NOK_MUSIC_MELODY.length] === null
          ? NOK_MUSIC_STEP_DURATION * 1.65
          : NOK_MUSIC_STEP_DURATION * 0.82;
      this.scheduleOcarina(note, time, length);
    }

    if ([6, 14, 30, 38, 54, 62].includes(localStep)) {
      const chord = NOK_MUSIC_CHORDS[chordIndex];
      const sparkleNote = chord[chord.length - 1];
      if (sparkleNote) this.scheduleBell(sparkleNote + 12, time, 1.8);
    }
  }

  connectVoice(source, reverbAmount, delayAmount) {
    if (!this.context || !this.musicBus || !this.reverb || !this.delay) return;
    source.connect(this.musicBus);
    const reverbSend = this.context.createGain();
    const delaySend = this.context.createGain();
    reverbSend.gain.value = reverbAmount;
    delaySend.gain.value = delayAmount;
    source.connect(reverbSend).connect(this.reverb);
    source.connect(delaySend).connect(this.delay);
  }

  schedulePad(notes, time, duration) {
    const context = this.context;
    if (!context) return;
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1050, time);
    filter.frequency.linearRampToValueAtTime(1650, time + duration * 0.55);
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(0.072, time + 1.25);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    filter.connect(envelope);
    this.connectVoice(envelope, 0.5, 0.02);

    notes.forEach((note, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index % 2 === 0 ? "triangle" : "sine";
      oscillator.frequency.value = nokMusicMidiFrequency(note);
      oscillator.detune.value = index % 2 === 0 ? -4 : 4;
      oscillator.connect(filter);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.05);
    });
  }

  scheduleBass(note, time, duration) {
    const context = this.context;
    if (!context) return;
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = nokMusicMidiFrequency(note);
    filter.type = "lowpass";
    filter.frequency.value = 420;
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(0.09, time + 0.7);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(filter).connect(envelope);
    this.connectVoice(envelope, 0.35, 0);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.05);
  }

  scheduleOcarina(note, time, duration) {
    const context = this.context;
    if (!context) return;
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    filter.type = "lowpass";
    filter.frequency.value = 3900;
    filter.Q.value = 0.8;
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(0.12, time + 0.075);
    envelope.gain.setValueAtTime(0.105, time + Math.max(0.1, duration * 0.65));
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    filter.connect(envelope);
    this.connectVoice(envelope, 0.72, 0.18);

    const fundamental = context.createOscillator();
    const airTone = context.createOscillator();
    fundamental.type = "sine";
    airTone.type = "triangle";
    fundamental.frequency.value = nokMusicMidiFrequency(note);
    airTone.frequency.value = nokMusicMidiFrequency(note) * 2.002;
    const airGain = context.createGain();
    airGain.gain.value = 0.07;
    fundamental.connect(filter);
    airTone.connect(airGain).connect(filter);
    fundamental.start(time);
    airTone.start(time);
    fundamental.stop(time + duration + 0.04);
    airTone.stop(time + duration + 0.04);

    if (this.noiseBuffer) {
      const breath = context.createBufferSource();
      const breathFilter = context.createBiquadFilter();
      const breathGain = context.createGain();
      breath.buffer = this.noiseBuffer;
      breath.loop = true;
      breathFilter.type = "bandpass";
      breathFilter.frequency.value = 2700;
      breathFilter.Q.value = 1.2;
      breathGain.gain.setValueAtTime(0.0001, time);
      breathGain.gain.linearRampToValueAtTime(0.012, time + 0.08);
      breathGain.gain.linearRampToValueAtTime(0.0001, time + duration);
      breath.connect(breathFilter).connect(breathGain).connect(envelope);
      breath.start(time);
      breath.stop(time + duration + 0.02);
    }
  }

  scheduleBell(note, time, duration) {
    const context = this.context;
    if (!context) return;
    const oscillator = context.createOscillator();
    const shimmer = context.createOscillator();
    const shimmerGain = context.createGain();
    const envelope = context.createGain();
    oscillator.type = "sine";
    shimmer.type = "sine";
    oscillator.frequency.value = nokMusicMidiFrequency(note);
    shimmer.frequency.value = nokMusicMidiFrequency(note) * 2.51;
    shimmerGain.gain.value = 0.18;
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(0.08, time + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(envelope);
    shimmer.connect(shimmerGain).connect(envelope);
    this.connectVoice(envelope, 0.8, 0.3);
    oscillator.start(time);
    shimmer.start(time);
    oscillator.stop(time + duration + 0.05);
    shimmer.stop(time + duration + 0.05);
  }
}

window.NokMusicEngine = NokMusicEngine;
