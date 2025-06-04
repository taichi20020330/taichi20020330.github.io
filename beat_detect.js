let audioContext;
let lastBPM = 0;

async function start() {
  audioContext = new AudioContext();
  await audioContext.audioWorklet.addModule('bpm_worklet.js');

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mic = audioContext.createMediaStreamSource(stream);

  const bpmNode = new AudioWorkletNode(audioContext, 'bpm-processor');

  bpmNode.port.onmessage = (event) => {
    const bpm = event.data;
    if (Math.abs(bpm - lastBPM) > 5) return; // スパイク除去
    lastBPM = bpm;
    document.getElementById('bpm').textContent = `BPM: ${bpm}`;
    console.log("Detected BPM:", bpm);
  };

  mic.connect(bpmNode).connect(audioContext.destination);
}
