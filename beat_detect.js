let audioContext;
let onset;
let beatTimes = [];
let lastBPM = 0;

async function start() {
  audioContext = new AudioContext();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const micSource = audioContext.createMediaStreamSource(stream);

  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  onset = new AubioOnset("default", 1024, 512, audioContext.sampleRate);

  processor.onaudioprocess = function (e) {
    const input = e.inputBuffer.getChannelData(0);
    const isOnset = onset.do(input);

    if (isOnset) {
      const now = audioContext.currentTime;
      beatTimes.push(now);

      if (beatTimes.length > 10) beatTimes.shift();

      if (beatTimes.length >= 2) {
        const intervals = beatTimes.slice(1).map((t, i) => t - beatTimes[i]);
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const bpm = Math.round(60 / avg);

        if (Math.abs(bpm - lastBPM) > 5) return; // 急激な変化は無視
        lastBPM = bpm;

        document.getElementById("bpm").textContent = `BPM: ${bpm}`;
        console.log("Detected BPM:", bpm);
      }
    }
  };

  micSource.connect(processor);
  processor.connect(audioContext.destination);
}
