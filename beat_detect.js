let bpmSent = false;
let bpm = 0;

async function startBeatDetection() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  const processor = audioCtx.createScriptProcessor(1024, 1, 1);

  source.connect(analyser);
  analyser.connect(processor);
  processor.connect(audioCtx.destination);

  const energyHistory = [];
  let lastBeatTime = 0;

  processor.onaudioprocess = function (e) {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const instantEnergy = data.reduce((sum, v) => sum + v * v, 0);

    energyHistory.push(instantEnergy);
    if (energyHistory.length > 43) energyHistory.shift();

    const averageEnergy = energyHistory.reduce((sum, v) => sum + v, 0) / energyHistory.length;

    const now = audioCtx.currentTime;

    if (instantEnergy > 1.3 * averageEnergy) {
      if (now - lastBeatTime > 0.3) { // 300ms = 約200BPM以上防止
        const delta = now - lastBeatTime;
        lastBeatTime = now;
        bpm = Math.round(60 / delta);
        console.log("BPM:", bpm);

        if (!bpmSent && bpm >= 60 && bpm <= 200) {
          bpmSent = true;
          sendBPMToMicrobit(bpm); // ↓ここでmicro:bitへ送信
        }
      }
    }
  };
}

async function sendBPMToMicrobit () {
    
}