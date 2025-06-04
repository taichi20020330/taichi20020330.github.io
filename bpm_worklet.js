class BPMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.aubioReady = false;
    this.buffer = [];

    Aubio().then((aubio) => {
      this.onset = new aubio.Onset('default', 1024, 512, sampleRate);
      this.aubioReady = true;
    });

    this.beatTimes = [];
    this.lastBPM = 0;
  }

  process(inputs) {
    if (!this.aubioReady) return true;

    const input = inputs[0][0];
    if (!input) return true;

    const buf = Float32Array.from(input);
    if (this.onset.do(buf)) {
      const now = currentTime;
      this.beatTimes.push(now);
      if (this.beatTimes.length > 10) this.beatTimes.shift();

      if (this.beatTimes.length >= 2) {
        const intervals = this.beatTimes.slice(1).map((t, i) => t - this.beatTimes[i]);
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const bpm = Math.round(60 / avg);
        this.port.postMessage(bpm);
      }
    }

    return true;
  }
}

registerProcessor('bpm-processor', BPMProcessor);
